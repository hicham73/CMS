import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Guid } from '../../Guid';
import { AssessmentTemplate, QuestionGroup } from '../../models/assessment.model';
import { AssessmentService } from '../../services/assessment.service';
import { CrmService } from '../../services/crm.service';

@Component({
    selector: 'app-assessment',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './assessment.component.html',
    styleUrls: ['./assessment.component.scss']
})
export class AssessmentComponent implements OnInit {
    @Input() assessmentId: string = ''; // Assessment ID to load directly
    @Input() templateId: string = 'bf7a279f-20f7-4346-9704-e373879e0a87'; // Template ID to load
    @Input() participantId: string = ''; // Default participant ID
    @Input() caseId: string = ''; // Default case ID

    template: AssessmentTemplate | null = null;
    answers: { [key: string]: any } = {};
    loading = false;
    error = '';

    // Local state management instead of using AssessmentService observables
    private currentGroupIndexSubject = new BehaviorSubject<number>(0);
    currentGroupIndex$ = this.currentGroupIndexSubject.asObservable();

    // Track completion status locally
    isCompleted = false;

    // Track submission status
    submitting = false;
    submissionMessage = '';
    submissionSuccess = false;

    constructor(private assessmentService: AssessmentService, private crmService: CrmService) { }

    get currentGroup(): QuestionGroup | undefined {
        if (!this.template) return undefined;
        return this.template.groups[this.currentGroupIndexSubject.value];
    }

    get totalGroups(): number {
        return this.template?.groups?.length || 0;
    }

    getSelectedOptions(answers: { [key: string]: boolean }): string {
        if (!answers) return '';
        return Object.entries(answers)
            .filter(([_, selected]) => selected)
            .map(([option]) => option)
            .join(', ');
    }

    async ngOnInit() {
        // Only load from template ID
        if (!this.templateId) {
            this.error = 'No template ID provided. Please specify a template ID.';
            return;
        }

        await this.loadAssessmentFromTemplateId();
    }

    /**
     * Loads and initializes an assessment directly from a template ID
     * Only loads the template structure without creating any records in D365
     */
    async loadAssessmentFromTemplateId() {
        if (!this.templateId) {
            this.error = 'No template ID provided.';
            return;
        }

        this.loading = true;
        this.error = '';

        try {
            // Get the template with all its configuration
            this.template = await this.assessmentService.getAssessmentTemplate(this.templateId);

            if (!this.template) {
                throw new Error(`Template with ID ${this.templateId} not found`);
            }

            // Initialize answers object with empty values for each question
            this.answers = {};
            for (const group of this.template.groups) {
                for (const question of group.questions) {
                    if (question.type === 'multiple-choice') {
                        this.answers[question.id] = {};
                        for (const option of question.options || []) {
                            this.answers[question.id][option] = false;
                        }
                    } else if (question.type === 'date-range') {
                        this.answers[question.id] = { start: null, end: null };
                    } else {
                        this.answers[question.id] = '';
                    }
                }
            }

            // Reset the current group index
            this.currentGroupIndexSubject.next(0);
            this.isCompleted = false;
        } catch (error) {
            console.error('Error initializing assessment:', error);
            this.error = 'Failed to initialize assessment. Please try again.';
        } finally {
            this.loading = false;
        }
    }

    isCurrentGroupValid(): boolean {
        if (!this.currentGroup) return false;

        return this.currentGroup.questions.every(question => {
            const answer = this.answers[question.id];

            if (!question.required) return true;

            if (question.type === 'multiple-choice') {
                return Object.values(answer).some(val => val === true);
            } else if (question.type === 'date-range') {
                return answer.start && answer.end;
            } else {
                return !!answer;
            }
        });
    }

    async onSubmitGroup() {
        if (!this.isCurrentGroupValid()) return;

        const currentIndex = this.currentGroupIndexSubject.value;
        const isLastGroup = currentIndex === this.totalGroups - 1;

        if (isLastGroup) {
            // Complete the assessment
            this.isCompleted = true;
        } else {
            // Move to next group
            this.currentGroupIndexSubject.next(currentIndex + 1);
        }
    }

    onPrevious() {
        const currentIndex = this.currentGroupIndexSubject.value;
        if (currentIndex > 0) {
            this.currentGroupIndexSubject.next(currentIndex - 1);
        }
    }

    /**
     * Gets the name of a template by its ID
     * @param templateId The template ID to look up
     * @returns The template name or 'Unknown Template' if not found
     */
    getTemplateName(templateId: string): string {
        return this.template?.title || 'Unknown Template';
    }

    /**
     * Gets the appropriate CSS class for a status code
     * @param status The numeric status code
     * @returns CSS class name for styling
     */
    getStatusClass(status: number): string {
        switch (status) {
            case 727000001: return 'draft';
            case 727000002: return 'in-progress';
            case 727000003: return 'completed';
            case 727000004: return 'archived';
            default: return 'unknown';
        }
    }

    /**
     * Gets a human-readable label for a status code
     * @param status The numeric status code
     * @returns Human-readable status label
     */
    getStatusLabel(status: number): string {
        switch (status) {
            case 727000001: return 'Draft';
            case 727000002: return 'In Progress';
            case 727000003: return 'Completed';
            case 727000004: return 'Archived';
            default: return 'Unknown';
        }
    }

    /**
     * Reset the assessment to start over
     */
    resetAssessment() {
        if (this.template) {
            // Reset answers
            this.answers = {};
            for (const group of this.template.groups) {
                for (const question of group.questions) {
                    if (question.type === 'multiple-choice') {
                        this.answers[question.id] = {};
                        for (const option of question.options || []) {
                            this.answers[question.id][option] = false;
                        }
                    } else if (question.type === 'date-range') {
                        this.answers[question.id] = { start: null, end: null };
                    } else {
                        this.answers[question.id] = '';
                    }
                }
            }

            // Reset to first group
            this.currentGroupIndexSubject.next(0);
            this.isCompleted = false;
            this.submissionMessage = '';
        }
    }

    /**
     * Submits the assessment to D365
     * Creates an assessment response record and answer records for each question
     */
    async submitAssessment() {
        if (!this.template || !this.isCompleted) return;

        this.submitting = true;
        this.submissionMessage = 'Submitting assessment...';
        this.submissionSuccess = false;

        try {
            // 1. Create assessment response record
            const responseId = Guid.create().toString();
            const assessmentResponseData: Record<string, any> = {
                'pr_assessmentresponseid': responseId,
                'pr_name': `Assessment Response for ${this.participantId ? 'Participant' : 'Template'}`,
                'pr_assessmenttemplate@odata.bind': `/pr_assessmenttemplates(${this.templateId})`,
                'pr_startdate': new Date().toISOString(),
                'pr_status': 727000001 // InProgress
            };

            // Add participant if available
            if (this.participantId) {
                assessmentResponseData['pr_participant@odata.bind'] = `/contacts(${this.participantId})`;
            }

            // Create the assessment response record using the injected CrmService
            await this.crmService.createRecord(assessmentResponseData, 'pr_assessmentresponses');


            // 2. Create answer records for each question
            let sequence = 1;
            for (const group of this.template.groups) {
                for (const question of group.questions) {
                    const answer = this.answers[question.id];
                    if (answer === undefined || answer === null) continue;

                    // Format the answer based on question type
                    let formattedAnswer = '';

                    if (question.type === 'multiple-choice') {
                        formattedAnswer = this.getSelectedOptions(answer);
                    } else if (question.type === 'date-range') {
                        if (answer.start && answer.end) {
                            formattedAnswer = `${answer.start} - ${answer.end}`;
                        }
                    } else {
                        formattedAnswer = answer.toString();
                    }

                    // Skip if no answer provided
                    if (!formattedAnswer) continue;

                    const answerData: Record<string, any> = {
                        'pr_assessmentresponse@odata.bind': `/pr_assessmentresponses(${responseId})`,
                        'pr_assessmentquestion@odata.bind': `/pr_assessmentquestions(${question.id})`,
                        'pr_answer': formattedAnswer,
                        'pr_answereddate': new Date().toISOString(),
                        'pr_name': `Answer ${sequence}`,
                        'pr_sequence': sequence
                    };

                    // Create the answer record
                    await this.crmService.createRecord(answerData, 'pr_assessmentanswers');

                    sequence++;
                }
            }

            // 3. Update assessment response status to completed
            await this.crmService.updateRecord(
                responseId,
                { 'pr_status': 727000003, 'pr_completiondate': new Date().toISOString() },
                'pr_assessmentresponses'
            );

            this.submissionSuccess = true;
            this.submissionMessage = 'Assessment submitted successfully!';
        } catch (error) {
            console.error('Error submitting assessment:', error);
            this.submissionSuccess = false;
            this.submissionMessage = 'Failed to submit assessment. Please try again.';
        } finally {
            this.submitting = false;
        }
    }


}

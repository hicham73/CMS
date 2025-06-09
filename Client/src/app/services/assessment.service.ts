import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Assessment, AssessmentTemplate, Question, QuestionGroup, QuestionType } from '../models/assessment.model';
import { ODataResult } from '../models/crm.model';
import { CrmService } from './crm.service';

@Injectable({
    providedIn: 'root'
})
export class AssessmentService {
    private currentResponseId: string = '';
    private currentAssessmentSubject = new BehaviorSubject<Assessment>({
        id: '',
        templateId: '',
        status: 727000002,
        answers: {}
    });

    private currentGroupIndexSubject = new BehaviorSubject<number>(0);

    currentAssessment$ = this.currentAssessmentSubject.asObservable();
    currentGroupIndex$ = this.currentGroupIndexSubject.asObservable();

    private template?: AssessmentTemplate;

    constructor(private crmService: CrmService) { }

    get currentGroupIndex(): number {
        return this.currentGroupIndexSubject.value;
    }

    /**
     * Initializes a new assessment from a template ID
     * @param templateId The ID of the assessment template to use
     * @param participantId Optional participant ID
     * @param caseId Optional case ID
     * @returns Promise that resolves when the assessment is initialized
     */
    async initializeAssessmentFromId(templateId: string, participantId?: string, caseId?: string): Promise<void> {
        try {
            // Fetch the template with all its configuration
            const template = await this.getAssessmentTemplate(templateId);

            // Initialize the assessment with the retrieved template
            await this.initializeAssessment(template, participantId, caseId);
        } catch (error) {
            console.error(`Error initializing assessment from template ID ${templateId}:`, error);
            throw error;
        }
    }

    /**
     * Initializes a new assessment with the given template
     * @param template The assessment template to use
     * @param participantId Optional participant ID
     * @param caseId Optional case ID
     */
    async initializeAssessment(template: AssessmentTemplate, participantId?: string, caseId?: string) {
        this.template = template;

        try {
            // Create assessment response record in D365
            const assessmentResponse: Record<string, string> = {
                'pr_name': `Response for ${template.title}`,
                'pr_assessmenttemplate@odata.bind': `/pr_assessmenttemplates(${template.id})`,
                'pr_startdate': new Date().toISOString()
            };

            if (participantId) {
                assessmentResponse['pr_participant@odata.bind'] = `/contacts(${participantId})`;
            }

            // Create the assessment response in D365
            const responseResult = await this.crmService.createRecord(assessmentResponse, 'pr_assessmentresponses') as { pr_assessmentresponseid: string };
            this.currentResponseId = responseResult.pr_assessmentresponseid;

            // Create assessment record in D365
            const assessment: Record<string, string> = {
                'pr_name': `Assessment for ${template.title}`,
                'pr_assessmenttemplate@odata.bind': `/pr_assessmenttemplates(${template.id})`,
                'pr_data': JSON.stringify({}) // Empty answers object
            };

            if (participantId) {
                assessment['pr_participant@odata.bind'] = `/contacts(${participantId})`;
            }

            if (caseId) {
                assessment['pr_case@odata.bind'] = `/pr_participantcases(${caseId})`;
            }

            // Create the assessment in D365
            const assessmentResult = await this.crmService.createRecord(assessment, 'pr_assessments') as { pr_assessmentid: string };

            // Update the local state
            this.currentAssessmentSubject.next({
                id: assessmentResult.pr_assessmentid,
                templateId: template.id,
                status: 727000002,
                participantId: participantId,
                caseId: caseId,
                name: `Assessment for ${template.title}`,
                answers: {}
            });

            this.currentGroupIndexSubject.next(0);
        } catch (error) {
            console.error('Error initializing assessment:', error);
            throw error;
        }
    }

    /**
     * Saves an answer to a question
     * @param questionId The ID of the question being answered
     * @param answer The answer value
     * @returns Promise that resolves when the answer is saved
     */
    async saveAnswer(questionId: string, answer: any): Promise<void> {
        try {
            const currentAssessment = this.currentAssessmentSubject.value;
            const updatedAnswers = {
                ...currentAssessment.answers,
                [questionId]: answer
            };

            // Update local state
            this.currentAssessmentSubject.next({
                ...currentAssessment,
                answers: updatedAnswers
            });

            // Save to D365 - first check if answer already exists
            const fetchXml = `<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">
                <entity name="pr_assessmentanswer">
                    <attribute name="pr_assessmentanswerid" />
                    <filter type="and">
                        <condition attribute="pr_assessmentquestion" operator="eq" value="${questionId}" />
                        <condition attribute="pr_assessmentresponse" operator="eq" value="${this.currentResponseId}" />
                    </filter>
                </entity>
            </fetch>`;

            const result = await this.crmService.fetch('pr_assessmentanswers', fetchXml) as ODataResult;

            // Convert answer to string for storage
            const answerString = typeof answer === 'object' ? JSON.stringify(answer) : answer.toString();

            if (result.value && result.value.length > 0) {
                // Update existing answer
                const answerId = result.value[0]['pr_assessmentanswerid'];
                await this.crmService.updateRecord(answerId, {
                    'pr_answer': answerString,
                    'pr_answereddate': new Date().toISOString()
                }, 'pr_assessmentanswers');
            } else {
                // Create new answer
                const answerRecord = {
                    'pr_name': `Answer for ${questionId}`,
                    'pr_assessmentquestion@odata.bind': `/pr_assessmentquestions(${questionId})`,
                    'pr_assessmentresponse@odata.bind': `/pr_assessmentresponses(${this.currentResponseId})`,
                    'pr_answer': answerString,
                    'pr_answereddate': new Date().toISOString()
                };

                await this.crmService.createRecord(answerRecord, 'pr_assessmentanswers');
            }

            // Update the assessment data field with all answers
            await this.crmService.updateRecord(currentAssessment.id, {
                'pr_data': JSON.stringify(updatedAnswers)
            }, 'pr_assessments');

        } catch (error) {
            console.error('Error saving answer:', error);
            throw error;
        }
    }

    /**
     * Moves to the next group of questions
     * If this is the last group, completes the assessment
     */
    async moveToNextGroup() {
        const currentIndex = this.currentGroupIndexSubject.value;
        const currentAssessment = this.currentAssessmentSubject.value;

        // If this was the last group, complete the assessment
        if (this.template && currentIndex >= this.template.groups.length - 1) {
            try {
                // Update assessment status in D365
                await this.crmService.updateRecord(currentAssessment.id, {
                    'pr_status': 'completed',
                    'pr_completiondate': new Date().toISOString()
                }, 'pr_assessments');

                // Update assessment response status in D365
                await this.crmService.updateRecord(this.currentResponseId, {
                    'pr_status': 'Completed',
                    'pr_completiondate': new Date().toISOString()
                }, 'pr_assessmentresponses');

                // Update local state
                this.currentAssessmentSubject.next({
                    ...currentAssessment,
                    status: 727000002,
                    completionDate: new Date()
                });
            } catch (error) {
                console.error('Error completing assessment:', error);
                throw error;
            }
            return;
        }

        this.currentGroupIndexSubject.next(currentIndex + 1);
    }

    /**
     * Moves to the previous group of questions
     */
    moveToPreviousGroup() {
        const currentIndex = this.currentGroupIndexSubject.value;
        if (currentIndex > 0) {
            this.currentGroupIndexSubject.next(currentIndex - 1);
        }
    }

    /**
     * Fetches a specific assessment template by ID with all its configuration
     * @param templateId The ID of the assessment template to retrieve
     * @returns Promise with the fully configured assessment template
     */
    async getAssessmentTemplate(templateId: string): Promise<AssessmentTemplate> {
        try {
            // Fetch the template by ID
            const result = await this.crmService.retrieveRecord(
                templateId,
                'pr_assessmenttemplates'
            );

            if (!result) {
                throw new Error(`Assessment template with ID ${templateId} not found`);
            }

            // Create the template object
            const template: AssessmentTemplate = {
                id: result['pr_assessmenttemplateid'],
                title: result['pr_name'],
                description: result['pr_description'],
                category: result['pr_category'],
                type: result['pr_type'],
                version: result['pr_version'],
                status: result['pr_status'],
                configuration: result['pr_configuration'] ? JSON.parse(result['pr_configuration']) : {},
                groups: [] // Initialize with empty array, will be populated belo,
            };

            // Fetch question groups for this template
            template.groups = await this.getQuestionGroups(template.id);

            return template;
        } catch (error) {
            console.error(`Error fetching assessment template ${templateId}:`, error);
            throw error;
        }
    }

    /**
     * Fetches question groups for a specific assessment template
     * @param templateId The template ID
     * @returns Promise with array of question groups
     */
    private async getQuestionGroups(templateId: string): Promise<QuestionGroup[]> {
        try {
            // First get all questions for this template using the many-to-many relationship
            const questions = await this.getQuestionsByTemplateId(templateId);

            // Group the questions by their group
            const groupMap = new Map<string, QuestionGroup>();

            for (const question of questions) {
                if (!question.groupId) continue;

                question.options = await this.getQuestionOptions(question.id);

                if (!groupMap.has(question.groupId)) {
                    groupMap.set(question.groupId, {
                        id: question.groupId,
                        title: question.groupName || 'Unnamed Group',
                        description: '',
                        groupId: question.groupId,
                        questions: []
                    });
                }

                groupMap.get(question.groupId)?.questions.push(question);
            }

            // Convert the map to an array and sort by sequence if available
            return Array.from(groupMap.values());
        } catch (error) {
            console.error(`Error fetching question groups for template ${templateId}:`, error);
            throw error;
        }
    }

    /**
     * Fetches questions for a specific template using the many-to-many relationship
     * @param templateId The template ID
     * @returns Promise with array of questions
     */
    private async getQuestionsByTemplateId(templateId: string): Promise<Question[]> {
        try {
            // Fetch questions for this template using the many-to-many relationship
            const fetchXml = `<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">
                <entity name="pr_assessmentquestion">
                    <attribute name="pr_assessmentquestionid" />
                    <attribute name="pr_questiontext" />
                    <attribute name="pr_questiontype" />
                    <attribute name="pr_isrequired" />
                    <attribute name="pr_helptext" />
                    <attribute name="pr_sequence" />
                    <attribute name="pr_questiongroup" />
                    <link-entity name="pr_assessmentquestion_pr_assessmenttemp" from="pr_assessmentquestionid" to="pr_assessmentquestionid" link-type="inner">
                        <filter>
                            <condition attribute="pr_assessmenttemplateid" operator="eq" value="${templateId}" />
                        </filter>
                    </link-entity>
                    <link-entity name="pr_questiongroup" from="pr_questiongroupid" to="pr_questiongroup" alias="qg" link-type="outer">
                        <attribute name="pr_name" alias="groupName" />
                        <attribute name="pr_groupid" alias="groupId" />
                        <attribute name="pr_sequence" alias="groupSequence" />
                    </link-entity>
                    <order attribute="pr_sequence" />
                </entity>
            </fetch>`;

            const result = await this.crmService.fetch('pr_assessmentquestions', fetchXml) as { value: any[] };

            const questions: Question[] = [];

            for (const record of result.value) {
                const question: Question = {
                    id: record.pr_assessmentquestionid,
                    text: record.pr_questiontext,
                    type: this.mapQuestionType(record.pr_questiontype),
                    required: record.pr_isrequired === true,
                    helpText: record.pr_helptext || '',
                    sequence: record.pr_sequence,
                    groupId: record.groupId,
                    groupName: record.groupName,
                    options: await this.getQuestionOptions(record.pr_assessmentquestionid)
                };

                questions.push(question);
            }

            return questions;
        } catch (error) {
            console.error(`Error fetching questions for template ${templateId}:`, error);
            throw error;
        }
    }

    /**
     * Maps the D365 question type value to our QuestionType enum
     * @param d365Type The numeric value from D365 option set
     * @returns The mapped QuestionType
     */
    private mapQuestionType(d365Type: number): QuestionType {
        // Map the D365 option set values to our types
        // These values should match the option set in D365
        switch (d365Type) {
            case 727000001: return 'text';
            case 727000002: return 'single-choice';
            case 727000003: return 'multiple-choice';
            case 727000004: return 'yes-no';
            case 727000005: return 'date';
            case 727000006: return 'date-range';
            case 727000007: return 'number';
            default: return 'text';
        }
    }


    /**
     * Fetches options for a question (for choice-based questions)
     * @param questionId The question ID
     * @returns Promise with array of option strings
     */
    private async getQuestionOptions(questionId: string): Promise<string[]> {
        try {
            // Fetch options for this question
            const fetchXml = `<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">
                <entity name="pr_questionoption">
                    <attribute name="pr_optiontext" />
                    <filter type="and">
                        <condition attribute="pr_assessmentquestion" operator="eq" value="${questionId}" />
                    </filter>
                    <order attribute="pr_sequence" />
                </entity>
            </fetch>`;

            const result = await this.crmService.fetch('pr_questionoptions', fetchXml) as { value: any[] };

            return result.value.map(record => record.pr_optiontext);
        } catch (error) {
            console.error(`Error fetching options for question ${questionId}:`, error);
            return [];
        }
    }

    // End of getQuestionOptions method

    /**
     * Loads an existing assessment from D365
     * @param assessmentId The assessment ID to load
     */
    async loadAssessment(assessmentId: string): Promise<void> {
        try {
            // Retrieve the assessment record
            const assessment = await this.crmService.retrieveRecord(
                assessmentId,
                'pr_assessments'
            ) as any;

            if (!assessment) {
                throw new Error(`Assessment with ID ${assessmentId} not found`);
            }

            // Retrieve the template
            const template = await this.crmService.retrieveRecord(
                assessment._pr_assessmenttemplate_value,
                'pr_assessmenttemplates'
            ) as any;

            // Load the template with all its groups and questions
            this.template = {
                id: template.pr_assessmenttemplateid,
                title: template.pr_name,
                description: template.pr_description || '',
                category: template.pr_category,
                type: template.pr_type,
                version: template.pr_version,
                status: template.pr_status,
                configuration: template.pr_configuration,
                groups: await this.getQuestionGroups(template.pr_assessmenttemplateid)
            };

            // Find the associated assessment response
            const fetchXml = `<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">
                <entity name="pr_assessmentresponse">
                    <attribute name="pr_assessmentresponseid" />
                    <filter type="and">
                        <condition attribute="pr_assessmenttemplate" operator="eq" value="${template.pr_assessmenttemplateid}" />
                    </filter>
                    <order attribute="createdon" descending="true" />
                </entity>
            </fetch>`;

            const responseResult = await this.crmService.fetch('pr_assessmentresponses', fetchXml) as { value: any[] };

            if (responseResult.value && responseResult.value.length > 0) {
                this.currentResponseId = responseResult.value[0].pr_assessmentresponseid;
            }

            // Parse the answers from the data field
            let answers: { [questionId: string]: any } = {};
            if (assessment.pr_data) {
                try {
                    const parsedData = JSON.parse(assessment.pr_data);

                    // Process each answer to deserialize based on question type
                    if (this.template && this.template.groups) {
                        const allQuestions: Question[] = [];
                        this.template.groups.forEach(group => {
                            if (group.questions) {
                                allQuestions.push(...group.questions);
                            }
                        });

                        // Convert each answer using the appropriate deserializer
                        for (const [questionId, value] of Object.entries(parsedData)) {
                            const question = allQuestions.find(q => q.id === questionId);
                            if (question) {
                                answers[questionId] = this.deserializeAnswerValue(value as string, question.type);
                            } else {
                                answers[questionId] = value;
                            }
                        }
                    } else {
                        answers = parsedData;
                    }
                } catch (e) {
                    console.warn('Could not parse assessment data JSON:', e);
                }
            }

            // Update the current assessment state
            this.currentAssessmentSubject.next({
                id: assessment.pr_assessmentid,
                templateId: template.pr_assessmenttemplateid,
                status: assessment.pr_status,
                caseId: assessment.pr_case,
                participantId: assessment.pr_participant,
                completionDate: assessment.pr_completiondate ? new Date(assessment.pr_completiondate) : undefined,
                name: assessment.pr_name,
                type: assessment.pr_type,
                version: assessment.pr_version,
                answers: answers
            });

            // Start at the first group
            this.currentGroupIndexSubject.next(0);

        } catch (error) {
            console.error('Error loading assessment:', error);
            throw error;
        }
    }

    /**
     * Gets assessment statistics for a specific template
     * @param templateId The template ID to get statistics for
     * @returns Promise with assessment statistics
     */
    async getAssessmentStatistics(templateId: string): Promise<{ total: number; completed: number; inProgress: number; completionRate: number }> {
        try {
            // Build FetchXML to get assessment statistics
            const fetchXml = `<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false" aggregate="true">
                <entity name="pr_assessment">
                    <attribute name="pr_status" alias="status" groupby="true" />
                    <attribute name="pr_assessmentid" alias="count" aggregate="count" />
                    <filter type="and">
                        <condition attribute="pr_assessmenttemplate" operator="eq" value="${templateId}" />
                    </filter>
                </entity>
            </fetch>`;

            const result = await this.crmService.fetch('pr_assessments', fetchXml) as { value: any[] };

            // Process the results into a statistics object
            const statistics = {
                total: 0,
                completed: 0,
                inProgress: 0,
                completionRate: 0
            };

            for (const record of result.value) {
                const count = parseInt(record.count, 10);
                statistics.total += count;

                if (record.status === 'completed') {
                    statistics.completed += count;
                } else {
                    statistics.inProgress += count;
                }
            }

            // Calculate completion rate
            if (statistics.total > 0) {
                statistics.completionRate = (statistics.completed / statistics.total) * 100;
            }

            return statistics;
        } catch (error) {
            console.error('Error fetching assessment statistics:', error);
            throw error;
        }
    }

    /**
     * Gets the average time to complete an assessment for a specific template
     * @param templateId The template ID to analyze
     * @returns Promise with average completion time in minutes
     */
    async getAverageCompletionTime(templateId: string): Promise<number> {
        try {
            // Build FetchXML to get completed assessments with creation and completion dates
            const fetchXml = `<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">
                <entity name="pr_assessment">
                    <attribute name="pr_assessmentid" />
                    <attribute name="createdon" />
                    <attribute name="pr_completiondate" />
                    <filter type="and">
                        <condition attribute="pr_assessmenttemplate" operator="eq" value="${templateId}" />
                        <condition attribute="pr_status" operator="eq" value="completed" />
                        <condition attribute="pr_completiondate" operator="not-null" />
                    </filter>
                </entity>
            </fetch>`;

            const result = await this.crmService.fetch('pr_assessments', fetchXml) as { value: any[] };

            if (result.value.length === 0) {
                return 0; // No completed assessments
            }

            // Calculate average time difference in minutes
            let totalMinutes = 0;
            for (const record of result.value) {
                const createdOn = new Date(record.createdon);
                const completedOn = new Date(record.pr_completiondate);
                const diffMinutes = (completedOn.getTime() - createdOn.getTime()) / (1000 * 60);
                totalMinutes += diffMinutes;
            }

            return Math.round(totalMinutes / result.value.length);
        } catch (error) {
            console.error('Error calculating average completion time:', error);
            throw error;
        }
    }

    /**
     * Gets the most common answers for a specific question across all assessments
     * @param questionId The question ID to analyze
     * @param limit Maximum number of results to return
     * @returns Promise with array of answer frequencies
     */
    async getMostCommonAnswers(questionId: string, limit: number = 5): Promise<{ answer: string, count: number }[]> {
        try {
            // Build FetchXML to get answer frequencies for a specific question
            const fetchXml = `<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false" aggregate="true">
                <entity name="pr_assessmentanswer">
                    <attribute name="pr_value" alias="answer" groupby="true" />
                    <attribute name="pr_assessmentanswerid" alias="count" aggregate="count" />
                    <filter type="and">
                        <condition attribute="pr_question" operator="eq" value="${questionId}" />
                    </filter>
                    <order alias="count" descending="true" />
                </entity>
            </fetch>`;

            const result = await this.crmService.fetch('pr_assessmentanswers', fetchXml) as { value: any[] };

            // Process the results into answer frequencies
            const answerFrequencies: { answer: string, count: number }[] = [];

            for (const record of result.value) {
                if (answerFrequencies.length >= limit) break;

                answerFrequencies.push({
                    answer: record.answer,
                    count: parseInt(record.count, 10)
                });
            }

            return answerFrequencies;
        } catch (error) {
            console.error('Error fetching most common answers:', error);
            throw error;
        }
    }

    /**
     * Gets assessments for a specific participant or case
     * @param participantId Optional participant ID to filter by
     * @param caseId Optional case ID to filter by
     * @returns Promise with array of assessments
     */
    async getAssessments(participantId?: string, caseId?: string): Promise<Assessment[]> {
        try {
            // Build filter conditions based on parameters
            let filterConditions = '';
            if (participantId) {
                filterConditions += `<condition attribute="pr_participant" operator="eq" value="${participantId}" />`;
            }
            if (caseId) {
                filterConditions += `<condition attribute="pr_case" operator="eq" value="${caseId}" />`;
            }

            // If no filters provided, we'll get all assessments
            const fetchXml = `<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">
                <entity name="pr_assessment">
                    <attribute name="pr_assessmentid" />
                    <attribute name="pr_name" />
                    <attribute name="pr_assessmenttemplate" />
                    <attribute name="pr_status" />
                    <attribute name="pr_data" />
                    <attribute name="pr_case" />
                    <attribute name="pr_participant" />
                    <attribute name="pr_completiondate" />
                    <attribute name="pr_type" />
                    <attribute name="pr_version" />
                    ${filterConditions ? `<filter type="and">${filterConditions}</filter>` : ''}
                    <order attribute="createdon" descending="true" />
                </entity>
            </fetch>`;

            const result = await this.crmService.fetch('pr_assessments', fetchXml) as { value: any[] };

            // Map the D365 records to our model
            const assessments: Assessment[] = [];

            for (const record of result.value) {
                // Parse the answers from the data field
                let answers = {};
                if (record.pr_data) {
                    try {
                        answers = JSON.parse(record.pr_data);
                    } catch (e) {
                        console.warn('Could not parse assessment data JSON:', e);
                    }
                }

                const assessment: Assessment = {
                    id: record.pr_assessmentid,
                    templateId: record.pr_assessmenttemplate,
                    status: record.pr_status,
                    caseId: record.pr_case,
                    participantId: record.pr_participant,
                    completionDate: record.pr_completiondate ? new Date(record.pr_completiondate) : undefined,
                    name: record.pr_name,
                    type: record.pr_type,
                    version: record.pr_version,
                    answers: answers
                };

                assessments.push(assessment);
            }

            return assessments;
        } catch (error) {
            console.error('Error fetching assessments:', error);
            throw error;
        }
    }

    private serializeAnswerValue(value: any, questionType: QuestionType): string {
        if (value === null || value === undefined) {
            return '';
        }

        switch (questionType) {
            case 'date':
            case 'date-range':
                if (value instanceof Date) {
                    return value.toISOString();
                } else if (typeof value === 'string') {
                    // If it's already a string, check if it's a valid date format
                    try {
                        const date = new Date(value);
                        return date.toISOString();
                    } catch (e) {
                        return value;
                    }
                } else if (Array.isArray(value)) {
                    // For date ranges, serialize as JSON array of ISO strings
                    return JSON.stringify(value.map(d => d instanceof Date ? d.toISOString() : d));
                }
                return String(value);

            case 'multiple-choice':
                if (Array.isArray(value)) {
                    return JSON.stringify(value);
                }
                return String(value);

            case 'single-choice':
            case 'text':
            default:
                return String(value);
        }
    }

    /**
     * Deserializes a stored answer value from D365 based on the question type
     * @param value The serialized answer value
     * @param questionType The type of question
     * @returns Deserialized value in appropriate type
     */
    private deserializeAnswerValue(value: string, questionType: QuestionType): any {
        if (!value) {
            return null;
        }

        switch (questionType) {
            case 'date':
                try {
                    return new Date(value);
                } catch (e) {
                    return value;
                }

            case 'date-range':
                try {
                    const dates = JSON.parse(value);
                    if (Array.isArray(dates)) {
                        return dates.map(d => new Date(d));
                    }
                    return value;
                } catch (e) {
                    return value;
                }

            case 'multiple-choice':
                try {
                    return JSON.parse(value);
                } catch (e) {
                    return value;
                }

            case 'single-choice':
            case 'text':
            default:
                return value;
        }
    }

    /**
     * Exports assessment data for reporting or external analysis
     * @param templateId Optional template ID to filter assessments
     * @param startDate Optional start date for date range filtering
     * @param endDate Optional end date for date range filtering
     * @returns Promise with assessment export data
     */
    async exportAssessmentData(templateId?: string, startDate?: Date, endDate?: Date): Promise<any[]> {
        try {
            // Build filter conditions for FetchXML
            const filterConditions = [];

            if (templateId) {
                filterConditions.push(`<condition attribute="pr_assessmenttemplate" operator="eq" value="${templateId}" />`);
            }

            if (startDate) {
                filterConditions.push(`<condition attribute="createdon" operator="ge" value="${startDate.toISOString()}" />`);
            }

            if (endDate) {
                filterConditions.push(`<condition attribute="createdon" operator="le" value="${endDate.toISOString()}" />`);
            }

            // Build the filter XML
            const filterXml = filterConditions.length > 0
                ? `<filter type="and">${filterConditions.join('')}</filter>`
                : '';

            // Build FetchXML to get assessments with their template details
            const fetchXml = `<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">
                <entity name="pr_assessment">
                    <attribute name="pr_assessmentid" />
                    <attribute name="pr_name" />
                    <attribute name="pr_status" />
                    <attribute name="createdon" />
                    <attribute name="pr_completiondate" />
                    <link-entity name="pr_assessmenttemplate" from="pr_assessmenttemplateid" to="pr_assessmenttemplate" link-type="inner" alias="template">
                        <attribute name="pr_name" />
                    </link-entity>
                    ${filterXml}
                </entity>
            </fetch>`;

            const assessmentsResult = await this.crmService.fetch('pr_assessments', fetchXml) as { value: any[] };

            // For each assessment, get its answers
            const exportData = [];

            for (const assessment of assessmentsResult.value) {
                // Get assessment responses for this assessment
                const responsesFetchXml = `<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">
                    <entity name="pr_assessmentresponse">
                        <attribute name="pr_assessmentresponseid" />
                        <filter type="and">
                            <condition attribute="pr_assessment" operator="eq" value="${assessment.pr_assessmentid}" />
                        </filter>
                        <link-entity name="pr_questiongroup" from="pr_questiongroupid" to="pr_questiongroup" link-type="inner" alias="group">
                            <attribute name="pr_name" />
                        </link-entity>
                    </entity>
                </fetch>`;

                const responsesResult = await this.crmService.fetch('pr_assessmentresponses', responsesFetchXml) as { value: any[] };

                for (const response of responsesResult.value) {
                    // Get answers for this response
                    const answersFetchXml = `<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">
                        <entity name="pr_assessmentanswer">
                            <attribute name="pr_assessmentanswerid" />
                            <attribute name="pr_value" />
                            <filter type="and">
                                <condition attribute="pr_assessmentresponse" operator="eq" value="${response.pr_assessmentresponseid}" />
                            </filter>
                            <link-entity name="pr_question" from="pr_questionid" to="pr_question" link-type="inner" alias="question">
                                <attribute name="pr_name" />
                                <attribute name="pr_text" />
                                <attribute name="pr_type" />
                            </link-entity>
                        </entity>
                    </fetch>`;

                    const answersResult = await this.crmService.fetch('pr_assessmentanswers', answersFetchXml) as { value: any[] };

                    for (const answer of answersResult.value) {
                        exportData.push({
                            assessmentId: assessment.pr_assessmentid,
                            assessmentName: assessment.pr_name,
                            templateName: assessment['template.pr_name'],
                            status: assessment.pr_status,
                            createdOn: assessment.createdon,
                            completedOn: assessment.pr_completiondate,
                            groupName: response['group.pr_name'],
                            questionName: answer['question.pr_name'],
                            questionText: answer['question.pr_text'],
                            questionType: answer['question.pr_type'],
                            value: answer.pr_value
                        });
                    }
                }
            }

            return exportData;
        } catch (error) {
            console.error('Error exporting assessment data:', error);
            throw error;
        }
    }
}

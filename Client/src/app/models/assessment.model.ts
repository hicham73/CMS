export type QuestionType = 'text' | 'single-choice' | 'multiple-choice' | 'date' | 'date-range' | 'yes-no' | 'number';

// Maps to pr_assessmentquestion
export interface Question {
    id: string; // pr_assessmentquestionid
    type: QuestionType; // pr_questiontype
    text: string; // pr_questiontext
    required: boolean; // pr_isrequired
    options?: string[]; // Related pr_questionoption records
    helpText?: string; // pr_helptext
    sequence?: number; // pr_sequence
    groupId?: string; // pr_questiongroup - the group this question belongs to
    groupName?: string; // The name of the group from the linked entity
    conditionalDisplay?: {
        dependsOn: string;
        showWhen: string;
    };
}

// Maps to pr_questiongroup
export interface QuestionGroup {
    id: string; // pr_questiongroupid
    title: string; // pr_name
    description: string; // pr_description
    groupId?: string; // pr_groupid
    questions: Question[];
}

// Maps to pr_assessmenttemplate
export interface AssessmentTemplate {
    id: string; // pr_assessmenttemplateid
    title: string; // pr_name
    description: string; // pr_description
    category?: string; // pr_category
    type?: string; // pr_type
    version?: string; // pr_version
    status?: string; // pr_status
    configuration?: string; // pr_configuration (JSON)
    groups: QuestionGroup[];
}

// Maps to pr_assessmentanswer
export interface AssessmentAnswer {
    id?: string; // pr_assessmentanswerid
    questionId: string; // pr_assessmentquestion
    responseId?: string; // pr_assessmentresponse
    answer: any; // pr_answer
    answeredDate?: Date; // pr_answereddate
    name?: string; // pr_name
    sequence?: number; // pr_sequence
}

// Maps to pr_assessmentresponse
export interface AssessmentResponse {
    id: string; // pr_assessmentresponseid
    templateId: string; // pr_assessmenttemplate
    participantId?: string; // pr_participant
    startDate?: Date; // pr_startdate
    completionDate?: Date; // pr_completiondate
    status: string; // pr_status
    name?: string; // pr_name
}

// Maps to pr_assessment
export interface Assessment {
    id: string; // pr_assessmentid
    templateId: string; // pr_assessmenttemplate
    caseId?: string; // pr_case
    participantId?: string; // pr_participant
    completionDate?: Date; // pr_completiondate
    data?: string; // pr_data (JSON)
    name?: string; // pr_name
    status: number; // pr_status
    type?: string; // pr_type
    version?: string; // pr_version
    answers: { [key: string]: any }; // Local property, not directly mapped
}

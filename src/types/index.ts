export interface Report {
    id: number;
    student_name: string;
    student_email: string;
    college_id: string;
    category: string;
    description: string;
    location?: string;
    severity?: string;
    anonymous_preference: boolean;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface ReportCreate {
    student_name: string;
    student_email: string;
    college_id: string;
    category: string;
    description: string;
    location?: string;
    severity?: string;
    anonymous_preference: boolean;
}

export interface Resume {
  id: string;
  candidate_id: string;
  file_url: string;
  file_name: string;
  file_type?: string;
  extracted_text?: string;
  parse_status: "pending" | "processing" | "completed" | "failed";
  ai_summary?: string;
  uploaded_at: string;
  parsed_at?: string;
}

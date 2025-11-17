export interface TestSummary {
  slug: string;
  title: string;
}

export interface Submission {
  id: string;
  result_code: string;
  created_at: string; // ISO 문자열
  test_id: string;
  tests?: TestSummary | null;
}

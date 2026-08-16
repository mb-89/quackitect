// el-query-evaluator (fn-run-a-governed-walk.answer-a-structured-query).
// Not yet built — i15 M7. tests/query.test.ts asserts the real shape and is
// red until this lands.

export interface QueryFilterClause {
  field: string;
  equals?: string;
  not_equals?: string;
}

export interface QueryRequest {
  kind: string;
  filters?: { and?: QueryFilterClause[] };
  fields: string[];
}

export interface QueryResult {
  rows: Record<string, string>[];
}

export function answerStructuredQuery(_root: string, _request: QueryRequest): QueryResult {
  throw new Error("answerStructuredQuery: not yet built (i15 M7, tsp-query-answers)");
}

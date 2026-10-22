/** Activity types the kit itself distinguishes (the numbers are the backend contract, identical in every app). */
export const ActivityType = {
  COMMENT: 501,
  APPROVE: 802,
  GIVEBACK: 803,
  REJECT: 804,
  RETURN_TO_SUBMITTER: 806,
  CANCEL: 809,
  CANCEL_DOCUMENT: 901,
} as const;

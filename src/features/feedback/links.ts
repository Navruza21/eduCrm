/** Route of the public feedback form (outside the authenticated app). */
export const PUBLIC_FEEDBACK_PATH = '/f/:centerId'

/** The link a center hands out to its students and parents. */
export const publicFeedbackUrl = (centerId: string) => `${window.location.origin}/f/${centerId}`

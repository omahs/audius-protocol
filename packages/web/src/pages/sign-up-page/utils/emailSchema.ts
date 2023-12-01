import { signUpFetch } from '@audius/common'
import { z } from 'zod'

import { audiusQueryContext } from 'app/AudiusQueryProvider'
import { EMAIL_REGEX } from 'utils/email'

const messages = {
  invalidEmail: 'Please enter a valid email.',
  emailInUse: 'Email Already Taken'
}

export const emailSchema = z.object({
  email: z
    .string({ required_error: messages.invalidEmail })
    .regex(EMAIL_REGEX, { message: messages.invalidEmail })
    .refine(
      async (email) => {
        return !(await signUpFetch.isEmailInUse({ email }, audiusQueryContext))
      },
      { message: messages.emailInUse }
    )
})

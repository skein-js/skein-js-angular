import { tool } from '@langchain/core/tools';
import { z } from 'zod';

/** A real tool with no external service or extra API key. */
export const getCurrentTime = tool(
  ({ timeZone }) => {
    try {
      const time = new Intl.DateTimeFormat('en-GB', {
        timeZone,
        dateStyle: 'full',
        timeStyle: 'long',
      }).format(new Date());
      return timeZone + ': ' + time;
    } catch {
      return (
        'Unknown time zone: ' +
        timeZone +
        '. Use an IANA zone such as Asia/Tokyo.'
      );
    }
  },
  {
    name: 'get_current_time',
    description: 'Get the current date and time in an IANA time zone.',
    schema: z.object({
      timeZone: z
        .string()
        .describe('An IANA time zone, e.g. Africa/Nairobi or Asia/Tokyo'),
    }),
  },
);

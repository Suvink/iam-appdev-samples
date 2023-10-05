import type { NextApiRequest, NextApiResponse } from 'next'

const secret = process.env.NEXTAUTH_SECRET

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const redirectionUrl = (
                                "https://accounts.asgardeo.io/t/" + process.env.NEXT_PUBLIC_ASGARDEO_ORGANIZATION_NAME +
                                "/accountrecoveryendpoint/register.do?sp=" + process.env.NEXT_PUBLIC_ASGARDEO_APP_NAME
                            );
    // res.status(302).setHeader('Location', redirectionUrl)
    res.status(200).json({"location" : redirectionUrl});
}

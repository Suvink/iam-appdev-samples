import type { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const tokenObj: any = await getToken({ req, secret });
    console.log("tokenObj: " + JSON.stringify(tokenObj));

    const idToken = tokenObj?.idToken;
    console.log("idToken: " + idToken);
    
    let redirectionUrl = ("https://api.asgardeo.io/t/" + process.env.NEXT_PUBLIC_ASGARDEO_ORGANIZATION_NAME +
                                "/oidc/logout?post_logout_redirect_uri=" +
                                process.env.NEXT_PUBLIC_ASGARDEO_POST_LOGOUT_REDIRECT_URI
                            );
    if (idToken) {
        redirectionUrl += "&id_token_hint=" + idToken;
    }
    res.status(200).json({"location" : redirectionUrl});
}

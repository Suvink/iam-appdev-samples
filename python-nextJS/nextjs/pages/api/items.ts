import axios, { AxiosRequestConfig } from "axios";
import { getToken } from "next-auth/jwt";
import type { NextApiRequest, NextApiResponse } from 'next'

const secret = process.env.NEXTAUTH_SECRET
const apiUrl = process.env.NEXT_API_URL

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const tokenObj: any = await getToken({ req, secret });

        console.log("tokenObj: " + JSON.stringify(tokenObj));
        const requestConfig: AxiosRequestConfig = {
            headers: {
                Authorization: `Bearer ${tokenObj.accessToken}`
            }
        }

        if (req.method === 'GET') {
            const response = await axios.get(`${apiUrl}/items`, requestConfig);

            res.status(200).json(response.data);
        } else if (req.method === 'POST') {            
            const response = await axios.post(`${apiUrl}/items`, req.body, requestConfig);

            res.status(200).json(response.data);
        } else if (req.method === 'PUT') {
            const response = await axios.put(`${apiUrl}/items`, req.body, requestConfig);

            res.status(200).json(response.data);
        } else if (req.method === 'DELETE') {
            const itemId = req.body.items;
            const response = await axios.delete(`${apiUrl}/items/${itemId}`, requestConfig);

            res.status(200).json(response.data);
        } else if (req.method === 'PATCH') {            
            const itemId = req.body.itemId;
            const promoId = req.body.promoCodeId;
            const existingPromoId = req.body.existingPromoId;
            let obj = {};
            if (existingPromoId) {
                // we have to remove the exisitng promo code
                obj = {
                    addedPromoId : promoId,
                    removedPromoId : existingPromoId
                }
            } else {
                obj = {
                    addedPromoId : promoId,
                    removedPromoId : ""
                }
            }            
            const response = await axios.patch(`${apiUrl}/devices/${itemId}/promos`, obj, requestConfig);

            res.status(200).json(response.data);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ statusCode: 500, message: error })
    }
}
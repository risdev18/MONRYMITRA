import axios from 'axios';
import { config } from '../../config/env';

// This would be replaced by a robust service in production
export const sendWhatsAppMessage = async (to: string, templateName: string, parameters: any[]) => {
    try {
        const url = `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_ID}/messages`;

        // Mock for development
        if (process.env.NODE_ENV === 'development') {
            console.log(`[MOCK WHATSAPP] To: ${to}, Template: ${templateName}, Params:`, parameters);
            return { message_id: 'mock_msg_id_' + Date.now() };
        }

        const response = await axios.post(url, {
            messaging_product: 'whatsapp',
            to: to,
            type: 'template',
            template: {
                name: templateName,
                language: { code: 'en_US' }, // Should be dynamic based on customer language
                components: [
                    {
                        type: 'body',
                        parameters: parameters
                    }
                ]
            }
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error: any) {
        console.error('WhatsApp Send Error:', error.response?.data || error.message);
        throw new Error('Failed to send WhatsApp message');
    }
};

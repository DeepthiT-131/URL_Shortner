const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB({
    apiVersion: "2012-08-10",
    region: "us-east-1",
});

exports.handler = async (event, context, callback) => {
    try {
        console.log({ event });

        if (event.requestContext.http.method === "GET") {
            const { short_id } = (event.queryStringParameters);


            if (!short_id.length)
                return {
                    statusCode: 400,
                    body: "Short url cannot be empty ",
                };

            let resp = await dynamodb
                .getItem({
                    TableName: "url-shortner.",
                    Key: {
                        short_id: { S: short_id },
                    },
                })
                .promise();


            if (resp.Item === undefined) {
                return {
                    statusCode: 400,
                    body: "Opps! its not here.Please create short Url for this Url",
                };
            }

            return {
                statusCode: 302,
                headers: {
                    'location': `https://${resp.Item.long_id.S}`
                },

            };
        }
        if (event.requestContext.http.method === "POST") {
            const { long_id } = JSON.parse(event.body);
            if (long_id.length == 0) return { body: " url cannot be empty  " };
            let short_id =
                Math.random().toString(32).substring(2, 4) +
                Math.random().toString(32).substring(2, 4);

            let response = await dynamodb
                .putItem({
                    TableName: "url-shortner.",
                    Item: {
                        short_id: { S: short_id },
                        long_id: { S: long_id },
                    },
                })
                .promise();
            short_id = "https://aau6uyy7sb.execute-api.us-east-1.amazonaws.com/url_short?short_id=" + short_id;
            return { short_id};
        }
    } catch (err) {

        return {
            statusCode: 400,
            body: JSON.stringify(err),
        };
    }
};

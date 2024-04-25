# Medusa email plugin

Send emails on certain actions in medusa store

### Email templates

All email templates are stored under `data/emails` directory. This directory can be copy-pasted inside your medusa backend root directory.


## Installation

Run the following command

```bash
npm install --save @rootxpdev/medusa-email-plugin
```
or

```bash
yarn add @rootxpdev/medusa-email-plugin
```

Add the following values to your `medusa-config.js` file

```javascript
const plugins = [
  // ...other plugin configuration
  {
    resolve: "@rootxpdev/medusa-email-plugin",
    options: {
        templateDir: "node_modules/@rootxpdev/medusa-email-plugin/data/emails",
        fromAddress: "noreply@mymedusastore.com",
        smtpHost: "sandbox.smtp.mailtrap.io",
        smtpPort: 2525,
        smtpUser: "xxx",
        smtpPassword: "xxx",
    }
  },
];
```

host: "sandbox.smtp.mailtrap.io",
port: 2525,
auth: {
user: "2ff4e7fa6ad11d",
pass: "eb0281052bde8f"
}

## Testing locally

Run the following command to register this module locally

```bash
yarn link
```

Run this command inside your medusa backend folder to use it
```bash
yarn link "@rootxpdev/medusa-email-plugin"
```

#### Test emails

Launch your medusajs backend and call the following endpoint

```bash
curl --request POST \
  --url http://localhost:9000/email_test \
  --header 'Content-Type: application/json' \
  --data '{
	"event": "testing",
	"payload": {
		"foo": "bar"
	}
}'
```
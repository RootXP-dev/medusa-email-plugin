# Medusa email plugin

Send emails on certain actions in medusa store

### Email templates

All email templates are stored under `data/emails` directory. This directory can be copy-pasted inside your medusa backend root directory.

### Testing locally

Run the following command to register this module locally

```bash
yarn link
```

Run this command inside your medusa backend folder to use it
```bash
yarn link "@rootxpdev/medusa-email-plugin"
```

#### Test emails

```bash
curl --request POST \
  --url http://localhost:9001/email_test \
  --header 'Content-Type: application/json' \
  --data '{
	"event": "testing",
	"payload": {
		"foo": "bar"
	}
}'
```
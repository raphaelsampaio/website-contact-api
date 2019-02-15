.PHONY: deploy

deploy:
	cp contact.local.js contact.js
	sed -i '' 's/app\.listen.*//g' contact.js
	echo 'module.exports = app' >> contact.js
	claudia generate-serverless-express-proxy --express-module contact
	claudia create --handler lambda.handler --deploy-proxy-api --region us-west-2

clean:
	rm contact.js
	rm lambda.js

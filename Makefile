.PHONY: build deploy

build:
	cp contact.local.js contact.js
	sed -i '' 's/app\.listen.*//g' contact.js
	echo 'module.exports = app' >> contact.js

deploy: 
	claudia update --profile admin --runtime nodejs12.x

clean:
	rm contact.js

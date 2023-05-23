
all: fullpong

clean:
	rm fullpong.js

fullpong:
	cat engine.js > fullpong.js && cat newpong.js >> fullpong.js && sed -i "s/export //" fullpong.js && sed -i "s/import/\/\/import/" fullpong.js

MODULE		= d3.carto
EXPORT 		= $(MODULE)
ENTRY		= src/index.js
SRC		= $(ENTRY) $(wildcard src/*.js) $(wildcard src/*/*.js)
TEST = $(wildcard test/*.js)
BUNDLE 		= d3.carto.map.js
MINIFY 		= d3.carto.map.min.js
DIST 		= dist
META 		= $(wildcard *.json) $(wildcard *.md) LICENSE
 
.PHONY: all clean info watch test lint
 
all: $(MINIFY)
 
clean:
	rm -f $(BUNDLE)
	rm -f $(MINIFY)
	rm -rf $(DIST)/*
 
info:
	@echo "Source:" $(SRC)
 
watch:
	./node_modules/watchify/bin/cmd.js -s $(EXPORT) -o $(BUNDLE) $(ENTRY)
 
test: $(BUNDLE)
	./node_modules/mocha-casperjs/bin/mocha-casperjs $(TEST)
 
lint:
	./node_modules/jshint/bin/jshint $(SRC) $(TEST)
 
dist: $(MINIFY) $(META) $(DIST)
	cp *.js $(DIST)
	cp *.css $(DIST)
	cp $(META) $(DIST)
	cp -r examples $(DIST)
 
$(BUNDLE): $(SRC)
	./node_modules/browserify/bin/cmd.js -s $(EXPORT) -o $@ $(ENTRY)
 
$(DIST):
	git clone . dist
	cd dist
	git checkout gh-pages
 
$(MINIFY): $(BUNDLE)
	node ./node_modules/uglify-js/bin/uglifyjs --output $(MINIFY) $(BUNDLE)
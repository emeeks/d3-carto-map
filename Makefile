MODULE		= d3.carto.map
EXPORT 		= $(MODULE)
ENTRY		= src/index.js
SRC		= $(ENTRY) $(wildcard src/*.js) $(wildcard src/*/*.js)
BUNDLE 		= $(MODULE).js
MINIFY 		= $(MODULE).min.js
 
.PHONY: all clean info watch
 
all: $(MINIFY)
 
clean:
	rm -f $(BUNDLE)
	rm -f $(MINIFY)
 
info:
	@echo "Source:" $(SRC)
 
watch:
	./node_modules/watchify/bin/cmd.js -s $(EXPORT) -o $(BUNDLE) $(ENTRY)
 
$(BUNDLE): $(SRC)
	./node_modules/browserify/bin/cmd.js -s $(EXPORT) -o $@ $(ENTRY)
 
$(MINIFY): $(BUNDLE)
	./node_modules/uglify-js/bin/uglifyjs --output $(MINIFY) $(BUNDLE)
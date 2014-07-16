MODULE		= d3.carto
EXPORT 		= $(MODULE)
ENTRY		= src/index.js
SRC		= $(ENTRY) $(wildcard src/*.js) $(wildcard src/*/*.js)
BUNDLE 		= d3.carto.map.js
DEMO_BUNDLE 	= demo/bundle.js
DEMO_ENTRY 	= demo/main.js
 
.PHONY: all clean info watch
 
all: $(BUNDLE)
 
clean:
	rm -f $(BUNDLE)
 
info:
	@echo "Source:" $(SRC)
 
watch:
	./node_modules/watchify/bin/cmd.js -s $(EXPORT) -o $(BUNDLE) $(ENTRY)
 
$(BUNDLE): $(SRC)
	./node_modules/browserify/bin/cmd.js -s $(EXPORT) -o $@ $(ENTRY)
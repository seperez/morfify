# morfify

This repository contains the Morfify project.


##Requirements

    node 0.12.5


##How to install

###Install dependencies

    sudo npm install -g gulp serve

###Install Project

    git clone git@github.com:seperez/morfify.git
    cd morfify
    gulp build


##Run 

    cd morfify
    serve .


##Browse 
    https://localhost:3000/


##Gulp Tasks

**Gulp build:** generates bundles for development.

**Gulp watch:** generates bundles for development, watch changes on the files and re-build.

**Gulp dist:** generates bundles for production. It includes minification, revision and gziping.

**Gulp deploy:** push dist folder to gh-pages.


##Collaborators

- [Sebastián M. Pérez](https://github.com/seperez)
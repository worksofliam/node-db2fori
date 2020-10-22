# node-db2fori

Db2 for i client for Node.js. Written in pure JavaScript with no external dependencies.

## Goals :star2:

The goal for this project is to provide a Db2 for i client for Node.js without the need to install or download external tools (like ODBC). This means the client should be able to run anywhere that Node.js can run (which is most systems).

## Documentation :blue_book:

As of now, there is none. The code will be documented as well as possible, but since there is no prior documentation on the socket connection there might be gaps.

The plan is that when the base Connection API is done, then official documentation will be created. It is important that when writing code, the internal jsdoc be updated along side it. This is important to maintain a clean code base.

## Contributing

node-db2fori :cupid: contributions!

If you're interested in finding someway to help out with the code it's important to note that node-db2fori is based off of jtopenlite, which is part of the JTOpen project. Since that is also a native implementation (for Java) it was easier to base lots of code off of that (except it's simpler in Node!).

I will happily accept your pull request if it:

* has tests
* has the relevant jsdoc
* does not break backwards compatibility

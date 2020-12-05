# Table of Contents:
1. [JStream by TogaTech](https://github.com/TogaTech/JStream/blob/main/README.md#jstream-by-togatech)
    * [How JStream Works](https://github.com/TogaTech/JStream/blob/main/README.md#how-jstream-works)
2. [Client-side](https://github.com/TogaTech/JStream/blob/main/README.md#client-side)
    * [Getting Started](https://github.com/TogaTech/JStream/blob/main/README.md#getting-started)
    * [Documentation](https://github.com/TogaTech/JStream/blob/main/README.md#doumentation)
        * [Constructor](https://github.com/TogaTech/JStream/blob/main/README.md#constructor)
        * [Methods](https://github.com/TogaTech/JStream/blob/main/README.md#methods)
        * [Variables](https://github.com/TogaTech/JStream/blob/main/README.md#variables)
        * [Other Classes](https://github.com/TogaTech/JStream/blob/main/README.md#other-classes)
3. [Server-side](https://github.com/TogaTech/JStream/blob/main/README.md#other-classes)

# JStream by TogaTech
JStream by TogaTech is a client-side method to transmit live data between any number of web browser clients without the use of sockets or websockets. By default, the program uses the TogaTech JStream server to store and communicate data, but (coming soon) server owners can choose to download and host their own JStream servers on any hosting providers that support PHP and MySQL (and can withstand a PHP running time of 70 seconds). Server owners who host JStream can use SQL to send data instantly to subscribed clients.

## How JStream Works
A JStream client can provide live (or close to live) updates without much strain on servers. How is this possible? In JStream, the client uses XMLHttpRequests to send requests to the server checking for any updates. As soon as the client receives a response from the server, it interprets the data and immediately sends another request to the server. You might ask how this doesn't overwhelm the server. On the server-side, we use a PHP timeout of around 60 seconds. Every tenth of a second, PHP checks the SQL database for any updates to states, and if there are no updates, it continues to run until either it receives an update or 60 seconds is up. That way, if there are no updates, the client pings the server a maximum of once per minute. The client can send requests to PHP gateways to update or connect to JStreams instantly, but the main get method is asynchronous and calls a callback function if there are any state changes. If, for some reason, the server gateway is not working, the client will ping once per second until the server sends a valid response to prevent strain on the server and clients.

The MySQL database runs on a UUID system, where clients can subscribe to a (complex) UUID and receive any updates. Additionally, to ask for new information, a hash of the current state is supplied as a parameter for the server-side comparison. All requests use GET methods, which means that the full URL path is limited to 2048 characters (also a natural fail-safe for the database). To store more information, we recommend storing pointers or URLs to server gateways that will return the value. Server owners can also choose to modify the code and allow for POST requests.


# Client-side

## Getting Started
To get started with JStream, navigate to the `/client` folder and download `jstream.js`. Upload this code to your website and add the following script tag in the head of any page on which you want JStream (ensure that `jstream.js` is in the same directory as the website file or use absolute/relative paths):

`<script src="jstream.js" type="text/javascript"></script>`

Then, please see the documentation below on how to use JStream in the client.

## Doumentation

### Constructor

`new JStream(uuidInit, callback, serverInit)`

> constructor to create a new JStream instance
> 
> `String uuidInit` - the UUID for the instance (used to communicate with other clients, we recommend you generate a lengthy UUID that is difficult to guess, please keep in mind that UUID will be used upon every request and counts towards the 2048 character request limit)
> 
> `function callback` (optional) - the callback function for when the state is updated, callback function can have one parameter that contains the new state (this can be set later in the program)
> 
> `String serverInit` (optional) - the server hosting JStream (defaults to `https://jstream.togatech.org/server/`)
>
> Logs to the console the result of the operation

### Methods

`toString()`

> Returns basic data about the instance of the JStream (connected server and uuid)

`request(url, callback)`

> helper method, makes a `GET` request to the url and sends data to a callback function
>
> `String url` - the url for the `GET` request (formatted like `https://jstream.togatech.org/server/update?uuid=abc123&newState=test`)
>
> `function callback` - the callback function for when the request `Promise` is resolved, callback function can have one parameter that contains the result

`openStream()`

> opens the JStream
> 
> Returns `true` (the current status of the stream) if the operation is successful

`closeStream()`

> closes the JStream
> 
> Returns `false` (the current status of the stream) if the operation is successful

`ping()` - **INTERNAL METHOD**

> **THIS METHOD IS ONLY INTENDED FOR INTERNAL USE BY THE JSTREAM INSTANCE, NOT BY ANY PROGRAMS**
> Checks the server for any state changes using the method described at the top of this `README`, logs to the console the result of the operation, and calls a custom callback function if the state is updated
> This method will be called automatically by JStream, so there is no need to use this method in your code.

`updateState(newState)`

> Updates the state on the server and across all subscribed clients
>
> `String newState` - the new state (please keep in mind that the new state counts towards the 2048 character request limit)
>
> Returns `true` upon successful completion, logs to the console the result of the operation (if the request fails, it will continue to try again every second)

`onStateChange(callback)`

> sets the callback function for when the state is changed
>
> `function callback` - the callback function for when the state is updated, callback function can have one parameter that contains the new state
>
> Returns `true` upon successful completion

### Variables
`String state` - the current state of the JStream

`function stateCallback` - the callback function for when the state is updated, callback function can have one parameter that contains the new state

`String server` - the server hosting JStream (defaults to `https://jstream.togatech.org/server/`)

`String uuid` - the UUID for the instance (used to communicate with other clients, we recommend you generate a lengthy UUID that is difficult to guess, please keep in mind that UUID will be used upon every request and counts towards the 2048 character request limit)

`Boolean streamOpen` - the current status of the stream (`true` for open, `false` for closed)

`Boolean streamOpen` - the current status of the stream (`true` for open, `false` for closed)

### Other Classes

`SHA256(s)`

> Generates the SHA-256 hash used on the server to compare if the state has changed
>
> `String s` - the string to hash
>
> Returns the SHA-256 hashed value
>
> Original code by Angel Marin, Paul Johnston.
> http://www.webtoolkit.info/
> Internal methods undocumented

# Server-side
Server-side code for self-hosting JStream will be coming in the near future.

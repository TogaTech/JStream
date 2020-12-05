# JStream by TogaTech
JStream by TogaTech is a client-side method to transmit live data between any number of web browser clients without the use of sockets or websockets. By default, the program uses the TogaTech JStream server to store and communicate data, but (coming soon) server owners can choose to download and host their own JStream servers on any hosting providers that support PHP and MySQL (and can withstand a PHP running time of 70 seconds). Server owners who host JStream can use SQL to send data instantly to subscribed clients.

## How JStream Works
A JStream client can provide live (or close to live) updates without much strain on servers. How is this possible? In JStream, the client uses XMLHttpRequests to send requests to the server checking for any updates. As soon as the client receives a response from the server, it interprets the data and immediately sends another request to the server. You might ask how this doesn't overwhelm the server. On the server-side, we use a PHP timeout of around 60 seconds. Every tenth of a second, PHP checks the SQL database for any updates to states, and if there are no updates, it continues to run until either it receives an update or 60 seconds is up. That way, if there are no updates, the client pings the server a maximum of once per minute. The client can send requests to PHP gateways to update or connect to JStreams instantly, but the main get method is asynchronous and calls a callback function if there are any state changes.

The MySQL database runs on a UUID system, where clients can subscribe to a (complex) UUID and receive any updates. Additionally, to ask for new information, a hash of the current state is supplied as a parameter for the server-side comparison. All requests use GET methods, which means that the full URL path is limited to 2048 characters (also a natural fail-safe for the database). To store more information, we recommend storing pointers or URLs to server gateways that will return the value. Server owners can also choose to modify the code and allow for POST requests.


# Client-side

## Getting Started
To get started with JStream, navigate to the `/client` folder and download `jstream.js`. Upload this code to your website and add the following script tag in the head of any page on which you want JStream (ensure that `jstream.js` is in the same directory as the website file or use absolute/relative paths):

`<script src="jstream.js" type="text/javascript"></script>`

## Doumentation

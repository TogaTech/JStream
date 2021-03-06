console.log("%cPowered by TogaTech\n\n%cThis website uses JStream for live updating or communication between a server and/or other clients. JStream is powered by TogaTech. Please visit https://jstream.togatech.org/ to learn more about JStream.", "", "font-size: 20px;");
class JStream {
	constructor(uuidInit, callback, serverInit) {
		this.state = "";
		this.authcode = "";
		this.auth = true;
		this.stateCallback = callback;
		if(serverInit == null) {
			this.server = "https://jstream.togatech.org/server/";
		} else {
			this.server = serverInit;
		}
		this.uuid = uuidInit;
		this.streamOpen = false;
		this.connected = false;
		this.connect();
	}

	toString() {
		return "[JStream] Connected to " + this.server + " with uuid " + this.uuid + ".";
	}

	request(url, callback) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);

		xhr.onreadystatechange = function() {
			if (this.readyState == 4 && this.status === 200) {
				callback(this.response);
			}
		}
		xhr.send();
	}

	authenticate(username, password, store, callback) {
		if(store == null) {
			store = true;
		}
		this.request(this.server + "auth?code=" + SHA256(username + SHA256(password)), (response) => {
			try {
				console.log("[JStream] " + JSON.parse(response).message);
				if(JSON.parse(response).success) {
					if(store) {
						this.authcode = SHA256(username + SHA256(password));
					}
					if(callback != null) {
						callback(SHA256(username + SHA256(password)));
					}
				}
			} catch(err) {
				console.error("[JStream] Failed to connect to " + this.server + " because there was not a valid JStream endpoint set up on the server.");
			}
		});
	}

	connect() {
		if(!this.connected) {
			this.request(this.server + "connect?uuid=" + this.uuid, (data) => {
				try {
					if(JSON.parse(data).success) {
						console.log("[JStream] " + JSON.parse(data).message);
						this.connected = true;
						this.ping();
					} else {
						console.error("[JStream] Error when connecting to " + this.server + ". " + JSON.parse(data).message);
					}
				} catch(err) {
					console.error("[JStream] Failed to connect to " + this.server + " because there was not a valid JStream endpoint set up on the server.");
				}
			});
		} else {
			console.log("[JStream] JStream is already connected. Please use the disconnect method first.");
		}
	}

	disconnect() {
		if(!this.streamOpen) {
			this.connected = false;
		} else {
			console.log("[JStream] JStream has an open stream. Please use the closeStream method first.");
		}
	}

	openStream() {
		this.streamOpen = true;
		return this.streamOpen;
	}

	closeStream() {
		this.streamOpen = false;
		return this.streamOpen;
	}

	enableAuth() {
		this.auth = true;
		return this.auth;
	}

	disableAuth() {
		this.auth = false;
		return this.auth;
	}

	setStreamPermissions(read, write, admin, callback) {
		if(read == null) {
			read = "*";
		}
		if(write == null) {
			write = "*";
		}
		if(admin == null) {
			admin = "*";
		}
		let url = this.server + "permissions?uuid=" + this.uuid + "&read=" + read + "&write=" + write + "&admin=" + admin;
		if(this.auth) {
			url = this.server + "permissions?uuid=" + this.uuid + "&read=" + read + "&write=" + write + "&admin=" + admin + "&auth=" + this.authcode;
		}
		this.request(url, (data) => {
			try {
				if(JSON.parse(data).success) {
					console.log("[JStream] " + JSON.parse(data).message);
					if(callback != null) {
						callback();
					}
				} else {
					console.log("[JStream] Error when connecting to " + this.server + ". " + JSON.parse(data).message);
				}
			} catch(err) {
				console.error("[JStream] Failed to connect to " + this.server + " because there was not a valid JStream endpoint set up on the server.");
			}
		});
		
	}

	ping() {
		if(this.streamOpen) {
			console.log("[JStream] Ping");
			let url = this.server + "get?uuid=" + this.uuid + "&hash=" + SHA256(this.state);
			if(this.auth) {
				url = this.server + "get?uuid=" + this.uuid + "&hash=" + SHA256(this.state) + "&auth=" + this.authcode;
			}
			this.request(url, (response) => {
				if(this.streamOpen) {
					try {
						if(JSON.parse(response).stateChanged) {
							this.state = JSON.parse(response).state
							console.log("[JStream] " + JSON.parse(response).message);
							if(this.stateCallback != null) {
								this.stateCallback(this.state);
							}
						}
						if(this.connected) {
							this.ping();
						}
					} catch(err) {
						if(this.connected) {
							console.log("[JStream] Error when connecting to server, trying again in 1000ms.");
							setTimeout(() => {
								this.ping();
							}, 1000);
						}
					}
				}
			});
		} else {
			if(this.connected) {
				setTimeout(() => {
					this.ping();
				}, 1000);
			}
		}
	}

	updateState(newState, forced) {
		if(forced == null) {
			forced = true;
		}
		
		let url = this.server + "update?uuid=" + this.uuid + "&newState=" + newState;
		if(this.auth) {
			url = this.server + "update?uuid=" + this.uuid + "&newState=" + newState + "&auth=" + this.authcode;
		}
		this.request(url, (response) => {
			try {
				if(JSON.parse(response).success) {
					this.state = newState;
					console.log("[JStream] " + JSON.parse(response).message);
					return true;
				} else {
					console.log("[JStream] " + JSON.parse(response).message);
				}
			} catch(err) {
				if(forced) {
					console.log("[JStream] Error when connecting to server, trying again in 1000ms.");
					setTimeout(() => {
						updateState(newState);
					}, 1000);
				} else {
					console.error("[JStream] Failed to connect to " + this.server + " because there was not a valid JStream endpoint set up on the server.");
				}
			}
		});
	}

	onStateChange(callback) {
		this.stateCallback = callback;
		return true;
	}
}


/**
*
*  Secure Hash Algorithm (SHA256)
*  http://www.webtoolkit.info/
*
*  Original code by Angel Marin, Paul Johnston.
*
**/


function SHA256(s){

	var chrsz   = 8;
	var hexcase = 0;

	function safe_add (x, y) {
		var lsw = (x & 0xFFFF) + (y & 0xFFFF);
		var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		return (msw << 16) | (lsw & 0xFFFF);
	}

	function S (X, n) { return ( X >>> n ) | (X << (32 - n)); }
	function R (X, n) { return ( X >>> n ); }
	function Ch(x, y, z) { return ((x & y) ^ ((~x) & z)); }
	function Maj(x, y, z) { return ((x & y) ^ (x & z) ^ (y & z)); }
	function Sigma0256(x) { return (S(x, 2) ^ S(x, 13) ^ S(x, 22)); }
	function Sigma1256(x) { return (S(x, 6) ^ S(x, 11) ^ S(x, 25)); }
	function Gamma0256(x) { return (S(x, 7) ^ S(x, 18) ^ R(x, 3)); }
	function Gamma1256(x) { return (S(x, 17) ^ S(x, 19) ^ R(x, 10)); }

	function core_sha256 (m, l) {
		var K = new Array(0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786, 0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA, 0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070, 0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2);
		var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);
		var W = new Array(64);
		var a, b, c, d, e, f, g, h, i, j;
		var T1, T2;

		m[l >> 5] |= 0x80 << (24 - l % 32);
		m[((l + 64 >> 9) << 4) + 15] = l;

		for ( var i = 0; i<m.length; i+=16 ) {
			a = HASH[0];
			b = HASH[1];
			c = HASH[2];
			d = HASH[3];
			e = HASH[4];
			f = HASH[5];
			g = HASH[6];
			h = HASH[7];

			for ( var j = 0; j<64; j++) {
				if (j < 16) W[j] = m[j + i];
				else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);

				T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
				T2 = safe_add(Sigma0256(a), Maj(a, b, c));

				h = g;
				g = f;
				f = e;
				e = safe_add(d, T1);
				d = c;
				c = b;
				b = a;
				a = safe_add(T1, T2);
			}

			HASH[0] = safe_add(a, HASH[0]);
			HASH[1] = safe_add(b, HASH[1]);
			HASH[2] = safe_add(c, HASH[2]);
			HASH[3] = safe_add(d, HASH[3]);
			HASH[4] = safe_add(e, HASH[4]);
			HASH[5] = safe_add(f, HASH[5]);
			HASH[6] = safe_add(g, HASH[6]);
			HASH[7] = safe_add(h, HASH[7]);
		}
		return HASH;
	}

	function str2binb (str) {
		var bin = Array();
		var mask = (1 << chrsz) - 1;
		for(var i = 0; i < str.length * chrsz; i += chrsz) {
			bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i%32);
		}
		return bin;
	}

	function Utf8Encode(string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	}

	function binb2hex (binarray) {
		var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
		var str = "";
		for(var i = 0; i < binarray.length * 4; i++) {
			str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
			hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
		}
		return str;
	}

	s = Utf8Encode(s);
	return binb2hex(core_sha256(str2binb(s), s.length * chrsz));
}
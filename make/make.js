!(function (e, t) {
	'function' == typeof define && define.amd
		? define([], function () {
				return t(e);
		  })
		: 'object' == typeof exports
		? (module.exports = t(e))
		: (e.SmoothScroll = t(e));
})('undefined' != typeof global ? global : 'undefined' != typeof window ? window : this, function (b) {
	'use strict';
	function O() {
		for (var n = {}, e = 0; e < arguments.length; e++)
			!(function (e) {
				for (var t in e) e.hasOwnProperty(t) && (n[t] = e[t]);
			})(arguments[e]);
		return n;
	}
	function c(t) {
		var n;
		try {
			n = decodeURIComponent(t);
		} catch (e) {
			n = t;
		}
		return n;
	}
	function s(e) {
		'#' === e.charAt(0) && (e = e.substr(1));
		for (var t, n, o = String(e), r = o.length, a = -1, i = '', c = o.charCodeAt(0); ++a < r; ) {
			if (0 === (t = o.charCodeAt(a))) throw new InvalidCharacterError('Invalid character: the input contains U+0000.');
			i +=
				(1 <= t && t <= 31) || 127 == t || (0 === a && 48 <= t && t <= 57) || (1 === a && 48 <= t && t <= 57 && 45 === c)
					? '\\' + t.toString(16) + ' '
					: 128 <= t || 45 === t || 95 === t || (48 <= t && t <= 57) || (65 <= t && t <= 90) || (97 <= t && t <= 122)
					? o.charAt(a)
					: '\\' + o.charAt(a);
		}
		try {
			n = decodeURIComponent('#' + i);
		} catch (e) {
			n = '#' + i;
		}
		return n;
	}
	function I() {
		return Math.max(
			document.body.scrollHeight,
			document.documentElement.scrollHeight,
			document.body.offsetHeight,
			document.documentElement.offsetHeight,
			document.body.clientHeight,
			document.documentElement.clientHeight
		);
	}
	function w(e) {
		return e ? ((t = e), parseInt(b.getComputedStyle(t).height, 10) + e.offsetTop) : 0;
	}
	function C(e, t, n, o) {
		var r;
		t.emitEvents &&
			'function' == typeof b.CustomEvent &&
			((r = new CustomEvent(e, { bubbles: !0, detail: { anchor: n, toggle: o } })), document.dispatchEvent(r));
	}
	var L = {
		ignore: '[data-scroll-ignore]',
		header: null,
		topOnEmptyHash: !0,
		speed: 500,
		clip: !0,
		offset: 0,
		easing: 'easeInOutCubic',
		customEasing: null,
		updateURL: !0,
		popstate: !0,
		emitEvents: !0,
	};
	return function (o, e) {
		var g,
			r,
			y,
			v,
			t,
			S,
			E = {
				cancelScroll: function (e) {
					cancelAnimationFrame(S), (S = null), e || C('scrollCancel', g);
				},
			};
		E.animateScroll = function (i, c, e) {
			var s,
				u,
				o,
				r,
				a,
				l,
				d,
				m,
				f,
				t,
				h = O(g || L, e || {}),
				p = '[object Number]' === Object.prototype.toString.call(i),
				n = p || !i.tagName ? null : i;
			(p || n) &&
				((s = b.pageYOffset),
				h.header && !y && (y = document.querySelector(h.header)),
				(v = v || w(y)),
				(a = p
					? i
					: (function (e, t, n, o) {
							var r = 0;
							if (e.offsetParent) for (; (r += e.offsetTop), (e = e.offsetParent); );
							return (r = Math.max(r - t - n, 0)), o && (r = Math.min(r, I() - b.innerHeight)), r;
					  })(n, v, parseInt('function' == typeof h.offset ? h.offset(i, c) : h.offset, 10), h.clip)),
				(l = a - s),
				(d = I()),
				(f = function (e) {
					var t, n;
					(o = (m += e - (u = u || e)) / parseInt(h.speed, 10)),
						(r =
							s +
							l *
								((t = o = 1 < o ? 1 : o),
								'easeInQuad' === h.easing && (n = t * t),
								'easeOutQuad' === h.easing && (n = t * (2 - t)),
								'easeInOutQuad' === h.easing && (n = t < 0.5 ? 2 * t * t : (4 - 2 * t) * t - 1),
								'easeInCubic' === h.easing && (n = t * t * t),
								'easeOutCubic' === h.easing && (n = --t * t * t + 1),
								'easeInOutCubic' === h.easing && (n = t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
								'easeInQuart' === h.easing && (n = t * t * t * t),
								'easeOutQuart' === h.easing && (n = 1 - --t * t * t * t),
								'easeInOutQuart' === h.easing && (n = t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t),
								'easeInQuint' === h.easing && (n = t * t * t * t * t),
								'easeOutQuint' === h.easing && (n = 1 + --t * t * t * t * t),
								'easeInOutQuint' === h.easing && (n = t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t),
								h.customEasing && (n = h.customEasing(t)),
								n || t)),
						b.scrollTo(0, Math.floor(r)),
						(function (e, t) {
							var n,
								o,
								r,
								a = b.pageYOffset;
							if (e == t || a == t || (s < t && b.innerHeight + a) >= d)
								return (
									E.cancelScroll(!0),
									(o = t),
									(r = p),
									0 === (n = i) && document.body.focus(),
									r ||
										(n.focus(),
										document.activeElement !== n && (n.setAttribute('tabindex', '-1'), n.focus(), (n.style.outline = 'none')),
										b.scrollTo(0, o)),
									C('scrollStop', h, i, c),
									!(S = u = null)
								);
						})(r, a) || ((S = b.requestAnimationFrame(f)), (u = e));
				}),
				(m = 0) === b.pageYOffset && b.scrollTo(0, 0),
				(t = i),
				p ||
					(history.pushState &&
						h.updateURL &&
						history.pushState(
							{ smoothScroll: JSON.stringify(h), anchor: t.id },
							document.title,
							t === document.documentElement ? '#top' : '#' + t.id
						)),
				C('scrollStart', h, i, c),
				E.cancelScroll(!0),
				b.requestAnimationFrame(f));
		};
		function n(e) {
			var t, n;
			!(('matchMedia' in b && b.matchMedia('(prefers-reduced-motion)').matches) || 0 !== e.button || e.metaKey || e.ctrlKey) &&
				'closest' in e.target &&
				(r = e.target.closest(o)) &&
				'a' === r.tagName.toLowerCase() &&
				!e.target.closest(g.ignore) &&
				r.hostname === b.location.hostname &&
				r.pathname === b.location.pathname &&
				/#/.test(r.href) &&
				((t = s(c(r.hash))),
				(n =
					(n = g.topOnEmptyHash && '#' === t ? document.documentElement : document.querySelector(t)) || '#top' !== t
						? n
						: document.documentElement) && (e.preventDefault(), E.animateScroll(n, r)));
		}
		function a(e) {
			var t;
			null !== history.state &&
				history.state.smoothScroll &&
				history.state.smoothScroll === JSON.stringify(g) &&
				history.state.anchor &&
				(t = document.querySelector(s(c(history.state.anchor)))) &&
				E.animateScroll(t, null, { updateURL: !1 });
		}
		function i(e) {
			t =
				t ||
				setTimeout(function () {
					(t = null), (v = w(y));
				}, 66);
		}
		return (
			(E.destroy = function () {
				g &&
					(document.removeEventListener('click', n, !1),
					b.removeEventListener('resize', i, !1),
					b.removeEventListener('popstate', a, !1),
					E.cancelScroll(),
					(S = t = v = y = r = g = null));
			}),
			(E.init = function (e) {
				if (!('querySelector' in document && 'addEventListener' in b && 'requestAnimationFrame' in b && 'closest' in b.Element.prototype))
					throw 'Smooth Scroll: This browser does not support the required JavaScript methods and browser APIs.';
				E.destroy(),
					(g = O(L, e || {})),
					(y = g.header ? document.querySelector(g.header) : null),
					(v = w(y)),
					document.addEventListener('click', n, !1),
					y && b.addEventListener('resize', i, !1),
					g.updateURL && g.popstate && b.addEventListener('popstate', a, !1);
			}),
			E.init(e),
			E
		);
	};
}),
	new window.SmoothScroll('a[href*="#"]', { offset: 0 });
!(function () {
	const e = false;
	window.SendEvent = function (n) {
		if (!n) return void console.error('error when sending event');
		const t = JSON.stringify({ siteId: n.siteId, category: n.category, name: n.name, data: n.data, isPriorBlockingEnabled: e });
		if (n.asBeacon && navigator.sendBeacon) return void navigator.sendBeacon('/api/event', t);
		let o = new XMLHttpRequest();
		o.open('POST', '/api/event', !0), o.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8'), o.send(t);
	};
})();
!(function () {
	const e = false,
		n = new URLSearchParams(window.location.search),
		t = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
	(window.PageView = function () {
		const o = { referrer: document.referrer, path: window.location.pathname, isPriorBlockingEnabled: e };
		t.forEach(function (e) {
			const t = n.get(e);
			t && (o[e] = t);
		});
		let i = new XMLHttpRequest();
		i.open('POST', '/api/view', !0),
			i.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8'),
			i.send(JSON.stringify(o));
	}),
		window.PageView();
})();
!(function () {
	const t = document.querySelectorAll('a'),
		n = new URLSearchParams(window.location.search),
		e = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
	Array.prototype.forEach.call(t, function (t, c) {
		t.addEventListener('click', function (c) {
			const o = { url: t.href, btn_id: t.id };
			e.forEach(function (t) {
				const e = n.get(t);
				e && (o[t] = e);
			}),
				window.SendEvent({ siteId: 'y3yetqtujdtv2xbv', category: 'button', name: t.innerText, data: o, asBeacon: !0 });
		});
	});
})();

var __assign =
		(this && this.__assign) ||
		function () {
			return (__assign =
				Object.assign ||
				function (t) {
					for (var i, a = 1, n = arguments.length; a < n; a++)
						for (var s in (i = arguments[a])) Object.prototype.hasOwnProperty.call(i, s) && (t[s] = i[s]);
					return t;
				}).apply(this, arguments);
		},
	CountUp = (function () {
		function t(t, i, a) {
			var h = this;
			(this.endVal = i),
				(this.options = a),
				(this.version = '2.1.0'),
				(this.defaults = {
					startVal: 0,
					decimalPlaces: 0,
					duration: 2,
					useEasing: !0,
					useGrouping: !0,
					smartEasingThreshold: 999,
					smartEasingAmount: 333,
					separator: ',',
					decimal: '.',
					prefix: '',
					suffix: '',
					enableScrollSpy: !1,
					scrollSpyDelay: 200,
				}),
				(this.finalEndVal = null),
				(this.useEasing = !0),
				(this.countDown = !1),
				(this.error = ''),
				(this.startVal = 0),
				(this.paused = !0),
				(this.count = function (t) {
					h.startTime || (h.startTime = t);
					var i = t - h.startTime;
					(h.remaining = h.duration - i),
						h.useEasing
							? h.countDown
								? (h.frameVal = h.startVal - h.easingFn(i, 0, h.startVal - h.endVal, h.duration))
								: (h.frameVal = h.easingFn(i, h.startVal, h.endVal - h.startVal, h.duration))
							: h.countDown
							? (h.frameVal = h.startVal - (h.startVal - h.endVal) * (i / h.duration))
							: (h.frameVal = h.startVal + (h.endVal - h.startVal) * (i / h.duration)),
						h.countDown
							? (h.frameVal = h.frameVal < h.endVal ? h.endVal : h.frameVal)
							: (h.frameVal = h.frameVal > h.endVal ? h.endVal : h.frameVal),
						(h.frameVal = Number(h.frameVal.toFixed(h.options.decimalPlaces))),
						h.printValue(h.frameVal),
						i < h.duration
							? (h.rAF = requestAnimationFrame(h.count))
							: null !== h.finalEndVal
							? h.update(h.finalEndVal)
							: h.callback && h.callback();
				}),
				(this.formatNumber = function (t) {
					var i,
						a = t < 0 ? '-' : '',
						n = Math.abs(t).toFixed(h.options.decimalPlaces),
						s = (n += '').split('.'),
						e = s[0],
						r = 1 < s.length ? h.options.decimal + s[1] : '';
					if (h.options.useGrouping) {
						i = '';
						for (var o = 0, l = e.length; o < l; ++o) 0 !== o && o % 3 == 0 && (i = h.options.separator + i), (i = e[l - o - 1] + i);
						e = i;
					}
					return (
						h.options.numerals &&
							h.options.numerals.length &&
							((e = e.replace(/[0-9]/g, function (t) {
								return h.options.numerals[+t];
							})),
							(r = r.replace(/[0-9]/g, function (t) {
								return h.options.numerals[+t];
							}))),
						a + h.options.prefix + e + r + h.options.suffix
					);
				}),
				(this.easeOutExpo = function (t, i, a, n) {
					return (a * (1 - Math.pow(2, (-10 * t) / n)) * 1024) / 1023 + i;
				}),
				(this.options = __assign(__assign({}, this.defaults), a)),
				(this.formattingFn = this.options.formattingFn ? this.options.formattingFn : this.formatNumber),
				(this.easingFn = this.options.easingFn ? this.options.easingFn : this.easeOutExpo),
				(this.startVal = this.validateValue(this.options.startVal)),
				(this.frameVal = this.startVal),
				(this.endVal = this.validateValue(i)),
				(this.options.decimalPlaces = Math.max(this.options.decimalPlaces)),
				this.resetDuration(),
				(this.options.separator = String(this.options.separator)),
				(this.useEasing = this.options.useEasing),
				'' === this.options.separator && (this.options.useGrouping = !1),
				(this.el = 'string' == typeof t ? document.getElementById(t) : t),
				this.el ? this.printValue(this.startVal) : (this.error = '[CountUp] target is null or undefined'),
				void 0 !== window &&
					this.options.enableScrollSpy &&
					(this.error
						? console.error(this.error, t)
						: ((window.onScrollFns = window.onScrollFns || []),
						  window.onScrollFns.push(function () {
								return h.handleScroll(h);
						  }),
						  (window.onscroll = function () {
								window.onScrollFns.forEach(function (t) {
									return t();
								});
						  }),
						  this.handleScroll(this)));
		}
		return (
			(t.prototype.handleScroll = function (t) {
				var i, a;
				t &&
					window &&
					((i = window.innerHeight + window.scrollY),
					(a = t.el.offsetTop + t.el.offsetHeight) < i && a > window.scrollY && t.paused
						? ((t.paused = !1),
						  setTimeout(function () {
								return t.start();
						  }, t.options.scrollSpyDelay))
						: window.scrollY > a && !t.paused && t.reset());
			}),
			(t.prototype.determineDirectionAndSmartEasing = function () {
				var t = this.finalEndVal ? this.finalEndVal : this.endVal;
				this.countDown = this.startVal > t;
				var i,
					a = t - this.startVal;
				Math.abs(a) > this.options.smartEasingThreshold
					? ((this.finalEndVal = t),
					  (i = this.countDown ? 1 : -1),
					  (this.endVal = t + i * this.options.smartEasingAmount),
					  (this.duration = this.duration / 2))
					: ((this.endVal = t), (this.finalEndVal = null)),
					this.finalEndVal ? (this.useEasing = !1) : (this.useEasing = this.options.useEasing);
			}),
			(t.prototype.start = function (t) {
				this.error ||
					((this.callback = t),
					0 < this.duration
						? (this.determineDirectionAndSmartEasing(), (this.paused = !1), (this.rAF = requestAnimationFrame(this.count)))
						: this.printValue(this.endVal));
			}),
			(t.prototype.pauseResume = function () {
				this.paused
					? ((this.startTime = null),
					  (this.duration = this.remaining),
					  (this.startVal = this.frameVal),
					  this.determineDirectionAndSmartEasing(),
					  (this.rAF = requestAnimationFrame(this.count)))
					: cancelAnimationFrame(this.rAF),
					(this.paused = !this.paused);
			}),
			(t.prototype.reset = function () {
				cancelAnimationFrame(this.rAF),
					(this.paused = !0),
					this.resetDuration(),
					(this.startVal = this.validateValue(this.options.startVal)),
					(this.frameVal = this.startVal),
					this.printValue(this.startVal);
			}),
			(t.prototype.update = function (t) {
				cancelAnimationFrame(this.rAF),
					(this.startTime = null),
					(this.endVal = this.validateValue(t)),
					this.endVal !== this.frameVal &&
						((this.startVal = this.frameVal),
						this.finalEndVal || this.resetDuration(),
						(this.finalEndVal = null),
						this.determineDirectionAndSmartEasing(),
						(this.rAF = requestAnimationFrame(this.count)));
			}),
			(t.prototype.printValue = function (t) {
				var i = this.formattingFn(t);
				'INPUT' === this.el.tagName
					? (this.el.value = i)
					: 'text' === this.el.tagName || 'tspan' === this.el.tagName
					? (this.el.textContent = i)
					: (this.el.innerHTML = i);
			}),
			(t.prototype.ensureNumber = function (t) {
				return 'number' == typeof t && !isNaN(t);
			}),
			(t.prototype.validateValue = function (t) {
				var i = Number(t);
				return this.ensureNumber(i) ? i : ((this.error = '[CountUp] invalid start or end value: ' + t), null);
			}),
			(t.prototype.resetDuration = function () {
				(this.startTime = null), (this.duration = 1e3 * Number(this.options.duration)), (this.remaining = this.duration);
			}),
			t
		);
	})();

!(function () {
	const t = (t) => {
			const e = t.getAttribute('data-value');
			return -1 === e?.toString().indexOf('.') ? 0 : e?.toString().split('.')[1].length || 0;
		},
		e = function (e) {
			new CountUp(
				e,
				e.getAttribute('data-value'),
				((e) => {
					const n = document.getElementsByTagName('html')[0].getAttribute('lang');
					return { separator: (1e3).toLocaleString(n)[1], decimal: (1.1).toLocaleString(n)[1], decimalPlaces: t(e) };
				})(e)
			).start(),
				e.classList.remove('countup');
		},
		n = function () {
			document.querySelectorAll('.countup').forEach((t) => {
				(function (t, e) {
					const n = t.getBoundingClientRect(),
						o = window.innerHeight || document.documentElement.clientHeight;
					return !(
						Math.floor(100 - ((n.top >= 0 ? 0 : n.top) / +-n.height) * 100) < e || Math.floor(100 - ((n.bottom - o) / n.height) * 100) < e
					);
				})(t, 50) && e(t);
			});
		};
	let o = !1;
	document.addEventListener('scroll', function (t) {
		o ||
			(window.requestAnimationFrame(function () {
				n(), (o = !1);
			}),
			(o = !0));
	}),
		window.addEventListener('load', function (t) {
			n();
		});
})();

(window.OpenModal = function (o) {
	const e = document.querySelector('#' + o + '.umsoModalWrapper');
	if (!e) return;
	const n = e.querySelector('.umsoModalOverlay');
	e && n
		? ((e.style.display = 'block'),
		  n.addEventListener(
				'click',
				() => {
					window.CloseModal(o);
				},
				{ once: !0 }
		  ))
		: console.error('modal not found ', o);
}),
	(window.CloseModal = function (o) {
		const e = document.querySelector('#' + o + '.umsoModalWrapper');
		e ? (e.style.display = 'none') : console.error('modal not found', o);
	});

!(function () {
	const e = 'no',
		t = ['strictly_necessary'],
		n = ['strictly_necessary', 'functionality', 'performance', 'targeting'],
		o = 'cookie_consent',
		c = 'c_id',
		i = '0.0.1',
		r = ['landen_user_auth', 'landen_user_auth_dev', 'u_sp', 'lang', 'c_id'];
	function s(e) {
		let t = document.cookie.split(';');
		for (let n = 0; n < t.length; n++) {
			let o = t[n].split('=');
			if (e === o[0].trim()) return decodeURIComponent(o[1]);
		}
		return null;
	}
	function l() {
		let e = s(o);
		if (e) {
			const t = JSON.parse(e);
			return Array.isArray(t) ? t : t.split(',');
		}
		return t;
	}
	function d(e, t, n) {
		let o = new Date();
		o.setTime(o.getTime() + 24 * n * 60 * 60 * 1e3);
		const c = 'expires=' + o.toUTCString();
		document.cookie = e + '=' + t + ';' + c + ';path=/';
	}
	function u(e) {
		d(o, encodeURIComponent(JSON.stringify(e.join(','))), 360);
	}
	function a(e) {
		n.forEach((t) => {
			document.querySelectorAll('[data-cs-category=' + t + ']').forEach((n) => {
				if (n && 'SCRIPT' !== n.tagName) return;
				let o = document.createElement('script');
				e.includes(t) ? (o.type = 'text/javascript') : (o.type = 'text/plain'),
					m(n.src) || (o.src = n.src),
					m(n.innerText) || (o.innerText = n.innerText),
					0 !== n.classList.length && (o.classList = n.classList),
					m(n.id) || (o.id = n.id),
					o.setAttribute('data-cs-category', t),
					n.remove(),
					document.head.appendChild(o);
			});
		});
	}
	function m(e) {
		return !(void 0 !== e && e);
	}
	function f() {
		!(function () {
			let e = document.cookie.split('; ');
			for (let t = 0; t < e.length; t++) {
				let n = window.location.hostname.split('.');
				for (; n.length > 0; ) {
					let o = encodeURIComponent(e[t].split(';')[0].split('=')[0]);
					if (r.includes(o)) return;
					let c = o + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=' + n.join('.') + ' ;path=',
						i = location.pathname.split('/');
					for (document.cookie = c + '/'; i.length > 0; ) (document.cookie = c + i.join('/')), i.pop();
					n.shift();
				}
			}
		})();
		const e = (function () {
			let e = document.getElementsByTagName('input'),
				n = [];
			return (
				Array.prototype.forEach.call(e, function (e, t) {
					e.checked && n.push(e.value);
				}),
				n || t
			);
		})();
		u(e), window.CloseModal('cookieSettings'), a(e), p(e);
	}
	function p(e) {
		let t = (function () {
			let e = s(c);
			if (!e) {
				const e = Math.random().toString(36).substr(2, 6);
				return d(c, e, 360), e;
			}
			return e;
		})();
		const n = new XMLHttpRequest();
		n.open('POST', window.location.origin + '/api/consent-record', !0),
			n.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8'),
			n.send(JSON.stringify({ consentId: t, acceptedCategories: e, cookieBannerVersion: i, policyVersion: '1.0' })),
			(n.onload = function () {
				this.status < 200 && this.status >= 400 && console.error('http request failed. see request for more details');
			}),
			(n.onerror = function () {
				console.error('request failed');
			});
	}
	function g() {
		window.OpenModal('cookieSettings');
		const e = l();
		var t;
		(t = e),
			n.forEach((e) => {
				let n = document.querySelectorAll('.cookieSettingsCheckboxes input[name="' + e + '"]');
				0 !== n.length ? (n[0].checked = !!t.includes(e)) : console.error("couldn't set consent checkboxes");
			});
	}
	function y() {
		!(function () {
			const e = document.getElementById('cookieSettingsButton'),
				t = document.querySelector('.umsoPluginTarget');
			e
				? (t && (e.classList.add('cookieSettingsButtonRelative'), t.append(e)), (e.style.display = 'flex'))
				: console.error('cookieSettingsButton not found');
		})();
		const e = document.getElementById('bannerWrapper');
		e && (e.style.display = 'none'),
			(function () {
				const e = document.getElementById('madeWithUmso');
				null !== e && e.classList.add('badge--center');
			})();
	}
	function h() {
		!(function () {
			const e = document.getElementById('cookieSettingsButton');
			e ? (e.style.display = 'none') : console.error('cookieSettingsButton not found');
		})();
		const e = document.getElementById('bannerWrapper');
		e && (e.style.display = 'flex');
	}
	!(function () {
		const e = document.getElementById('bannerAcceptAllButton'),
			c = document.getElementById('bannerRejectAllButton'),
			i = document.getElementById('bannerSettingsButton'),
			r = document.getElementById('cookieSettingsButton'),
			l = document.getElementById('cookieSettingsSave'),
			d = document.querySelector('.umsoModalOverlay');
		e
			? e.addEventListener('click', () => {
					u(n), y(), a(n), p(n);
			  })
			: console.error('btnBannerAcceptAll not found'),
			c
				? c.addEventListener('click', () => {
						u(t), y(), p(t);
				  })
				: console.error('btnBannerRejectAll not found'),
			i
				? i.addEventListener('click', () => {
						g(), y();
				  })
				: console.error('btnBannerSettings not found'),
			r
				? r.addEventListener('click', () => {
						g();
				  })
				: console.error('btnCookieSettings not found'),
			l
				? l.addEventListener('click', () => {
						f();
				  })
				: console.error('btnConsentSave not found'),
			d
				? d.addEventListener('click', () => {
						s(o) ? y() : h();
				  })
				: console.error('bannerDisplay not found');
	})(),
		(function () {
			if ('yes' === e) {
				a(l());
			}
		})(),
		n.forEach((e) => {
			let t = document.querySelector('#checkbox_' + e + ' > .categorySummary');
			t &&
				t.addEventListener('click', () => {
					let t = document.querySelectorAll('.cookieSettingsCheckboxes input[name="' + e + '"]');
					t[0].checked = !t[0].checked;
				});
		}),
		document.cookie.match(o) ? y() : h();
})();

// ==========================================
// Phone masks configuration
// ==========================================
// # = digit, A = letter, * = any character
// ==========================================

export const PHONE_MASKS = {
	// Complete phone number masks sorted by country code (ascending order)
	// Includes all countries and territories from the original list plus missing ones
	// 'default' entry is placed at the end as a fallback

	"+1": { // United States/Canada
		"mask": "+1 (###) ###-####",
		"placeholder": "+1 (___) ___-____",
		"country": "US/CA"
	},
	"+7": { // Russia/Kazakhstan
		"mask": "+7 (###) ###-##-##",
		"placeholder": "+7 (___) ___-__-__",
		"country": "RU/KZ"
	},
	"+20": { // Egypt
		"mask": "+20 ### ### ####",
		"placeholder": "+20 ___ ___ ____",
		"country": "EG"
	},
	"+27": { // South Africa
		"mask": "+27 ## ### ####",
		"placeholder": "+27 __ ___ ____",
		"country": "ZA"
	},
	"+30": { // Greece
		"mask": "+30 ### ### ####",
		"placeholder": "+30 ___ ___ ____",
		"country": "GR"
	},
	"+31": { // Netherlands
		"mask": "+31 ## ### ####",
		"placeholder": "+31 __ ___ ____",
		"country": "NL"
	},
	"+32": { // Belgium
		"mask": "+32 ### ## ## ##",
		"placeholder": "+32 ___ __ __ __",
		"country": "BE"
	},
	"+33": { // France
		"mask": "+33 # ## ## ## ##",
		"placeholder": "+33 _ __ __ __ __",
		"country": "FR"
	},
	"+34": { // Spain
		"mask": "+34 ### ## ## ##",
		"placeholder": "+34 ___ __ __ __",
		"country": "ES"
	},
	"+36": { // Hungary
		"mask": "+36 ## ### ####",
		"placeholder": "+36 __ ___ ____",
		"country": "HU"
	},
	"+39": { // Italy
		"mask": "+39 ### ### ####",
		"placeholder": "+39 ___ ___ ____",
		"country": "IT"
	},
	"+40": { // Romania
		"mask": "+40 ## ### ####",
		"placeholder": "+40 __ ___ ____",
		"country": "RO"
	},
	"+41": { // Switzerland
		"mask": "+41 ## ### ## ##",
		"placeholder": "+41 __ ___ __ __",
		"country": "CH"
	},
	"+43": { // Austria
		"mask": "+43 ### ### ####",
		"placeholder": "+43 ___ ___ ____",
		"country": "AT"
	},
	"+44": { // United Kingdom
		"mask": "+44 ## #### ####",
		"placeholder": "+44 __ ____ ____",
		"country": "GB"
	},
	"+45": { // Denmark
		"mask": "+45 ## ## ## ##",
		"placeholder": "+45 __ __ __ __",
		"country": "DK"
	},
	"+46": { // Sweden
		"mask": "+46 ## ### ####",
		"placeholder": "+46 __ ___ ____",
		"country": "SE"
	},
	"+47": { // Norway
		"mask": "+47 ### ## ###",
		"placeholder": "+47 ___ __ ___",
		"country": "NO"
	},
	"+48": { // Poland
		"mask": "+48 ###-###-###",
		"placeholder": "+48 ___-___-___",
		"country": "PL"
	},
	"+49": { // Germany
		"mask": "+49 ### #######",
		"placeholder": "+49 ___ _______",
		"country": "DE"
	},
	"+51": { // Peru
		"mask": "+51 ### ### ###",
		"placeholder": "+51 ___ ___ ___",
		"country": "PE"
	},
	"+52": { // Mexico
		"mask": "+52 ## #### ####",
		"placeholder": "+52 __ ____ ____",
		"country": "MX"
	},
	"+53": { // Cuba
		"mask": "+53 ## ### ####",
		"placeholder": "+53 __ ___ ____",
		"country": "CU"
	},
	"+54": { // Argentina
		"mask": "+54 ## #### ####",
		"placeholder": "+54 __ ____ ____",
		"country": "AR"
	},
	"+55": { // Brazil
		"mask": "+55 ## #####-####",
		"placeholder": "+55 __ _____-____",
		"country": "BR"
	},
	"+56": { // Chile
		"mask": "+56 ## #### ####",
		"placeholder": "+56 __ ____ ____",
		"country": "CL"
	},
	"+57": { // Colombia
		"mask": "+57 ### ### ####",
		"placeholder": "+57 ___ ___ ____",
		"country": "CO"
	},
	"+58": { // Venezuela
		"mask": "+58 ### ### ####",
		"placeholder": "+58 ___ ___ ____",
		"country": "VE"
	},
	"+60": { // Malaysia
		"mask": "+60 ## ### ####",
		"placeholder": "+60 __ ___ ____",
		"country": "MY"
	},
	"+61": { // Australia
		"mask": "+61 # #### ####",
		"placeholder": "+61 _ ____ ____",
		"country": "AU"
	},
	"+62": { // Indonesia
		"mask": "+62 ### ### ####",
		"placeholder": "+62 ___ ___ ____",
		"country": "ID"
	},
	"+63": { // Philippines
		"mask": "+63 ### ### ####",
		"placeholder": "+63 ___ ___ ____",
		"country": "PH"
	},
	"+64": { // New Zealand
		"mask": "+64 ## ### ####",
		"placeholder": "+64 __ ___ ____",
		"country": "NZ"
	},
	"+65": { // Singapore
		"mask": "+65 #### ####",
		"placeholder": "+65 ____ ____",
		"country": "SG"
	},
	"+66": { // Thailand
		"mask": "+66 ## ### ####",
		"placeholder": "+66 __ ___ ____",
		"country": "TH"
	},
	"+81": { // Japan
		"mask": "+81 ##-####-####",
		"placeholder": "+81 __-____-____",
		"country": "JP"
	},
	"+82": { // South Korea
		"mask": "+82 ##-####-####",
		"placeholder": "+82 __-____-____",
		"country": "KR"
	},
	"+84": { // Vietnam
		"mask": "+84 ### ### ####",
		"placeholder": "+84 ___ ___ ____",
		"country": "VN"
	},
	"+86": { // China
		"mask": "+86 ###-####-####",
		"placeholder": "+86 ___-____-____",
		"country": "CN"
	},
	"+90": { // Turkey
		"mask": "+90 (###) ###-####",
		"placeholder": "+90 (___) ___-____",
		"country": "TR"
	},
	"+91": { // India
		"mask": "+91 #####-#####",
		"placeholder": "+91 _____-_____",
		"country": "IN"
	},
	"+92": { // Pakistan
		"mask": "+92 ### ### ####",
		"placeholder": "+92 ___ ___ ____",
		"country": "PK"
	},
	"+93": { // Afghanistan
		"mask": "+93 ## ### ####",
		"placeholder": "+93 __ ___ ____",
		"country": "AF"
	},
	"+95": { // Myanmar (Burma)
		"mask": "+95 ## ### ####",
		"placeholder": "+95 __ ___ ____",
		"country": "MM"
	},
	"+98": { // Iran
		"mask": "+98 ### ### ####",
		"placeholder": "+98 ___ ___ ____",
		"country": "IR"
	},
	"+211": { // South Sudan
		"mask": "+211 ## ### ####",
		"placeholder": "+211 __ ___ ____",
		"country": "SS"
	},
	"+212": { // Morocco
		"mask": "+212 ### ### ###",
		"placeholder": "+212 ___ ___ ___",
		"country": "MA"
	},
	"+213": { // Algeria
		"mask": "+213 ## ### ####",
		"placeholder": "+213 __ ___ ____",
		"country": "DZ"
	},
	"+216": { // Tunisia
		"mask": "+216 ## ### ###",
		"placeholder": "+216 __ ___ ___",
		"country": "TN"
	},
	"+218": { // Libya
		"mask": "+218 ## ### ###",
		"placeholder": "+218 __ ___ ___",
		"country": "LY"
	},
	"+220": { // Gambia
		"mask": "+220 ## ### ###",
		"placeholder": "+220 __ ___ ___",
		"country": "GM"
	},
	"+221": { // Senegal
		"mask": "+221 ## ### ## ##",
		"placeholder": "+221 __ ___ __ __",
		"country": "SN"
	},
	"+223": { // Mali
		"mask": "+223 ## ## ## ##",
		"placeholder": "+223 __ __ __ __",
		"country": "ML"
	},
	"+224": { // Guinea
		"mask": "+224 ## ### ###",
		"placeholder": "+224 __ ___ ___",
		"country": "GN"
	},
	"+226": { // Burkina Faso
		"mask": "+226 ## ## ## ##",
		"placeholder": "+226 __ __ __ __",
		"country": "BF"
	},
	"+230": { // Mauritius
		"mask": "+230 ### ####",
		"placeholder": "+230 ___ ____",
		"country": "MU"
	},
	"+233": { // Ghana
		"mask": "+233 ## ### ####",
		"placeholder": "+233 __ ___ ____",
		"country": "GH"
	},
	"+234": { // Nigeria
		"mask": "+234 ### ### ####",
		"placeholder": "+234 ___ ___ ____",
		"country": "NG"
	},
	"+235": { // Chad
		"mask": "+235 ## ## ## ##",
		"placeholder": "+235 __ __ __ __",
		"country": "TD"
	},
	"+236": { // Central African Republic
		"mask": "+236 ## ## ## ##",
		"placeholder": "+236 __ __ __ __",
		"country": "CF"
	},
	"+237": { // Cameroon
		"mask": "+237 ## ## ## ##",
		"placeholder": "+237 __ __ __ __",
		"country": "CM"
	},
	"+240": { // Equatorial Guinea
		"mask": "+240 ## ### ###",
		"placeholder": "+240 __ ___ ___",
		"country": "GQ"
	},
	"+242": { // Republic of Congo
		"mask": "+242 ## ### ####",
		"placeholder": "+242 __ ___ ____",
		"country": "CG"
	},
	"+245": { // Guinea-Bissau
		"mask": "+245 ## ### ###",
		"placeholder": "+245 __ ___ ___",
		"country": "GW"
	},
	"+250": { // Rwanda
		"mask": "+250 ### ### ###",
		"placeholder": "+250 ___ ___ ___",
		"country": "RW"
	},
	"+251": { // Ethiopia
		"mask": "+251 ## ### ####",
		"placeholder": "+251 __ ___ ____",
		"country": "ET"
	},
	"+254": { // Kenya
		"mask": "+254 ### ######",
		"placeholder": "+254 ___ ______",
		"country": "KE"
	},
	"+257": { // Burundi
		"mask": "+257 ## ## ## ##",
		"placeholder": "+257 __ __ __ __",
		"country": "BI"
	},
	"+260": { // Zambia
		"mask": "+260 ## ### ####",
		"placeholder": "+260 __ ___ ____",
		"country": "ZM"
	},
	"+263": { // Zimbabwe
		"mask": "+263 ## ### ####",
		"placeholder": "+263 __ ___ ____",
		"country": "ZW"
	},
	"+267": { // Botswana
		"mask": "+267 ## ### ###",
		"placeholder": "+267 __ ___ ___",
		"country": "BW"
	},
	"+268": { // Eswatini (Swaziland)
		"mask": "+268 ## ### ###",
		"placeholder": "+268 __ ___ ___",
		"country": "SZ"
	},
	"+269": { // Comoros
		"mask": "+269 ## ### ###",
		"placeholder": "+269 __ ___ ___",
		"country": "KM"
	},
	"+290": { // Saint Helena
		"mask": "+290 ####",
		"placeholder": "+290 ____",
		"country": "SH"
	},
	"+291": { // Eritrea
		"mask": "+291 ## ### ###",
		"placeholder": "+291 __ ___ ___",
		"country": "ER"
	},
	"+297": { // Aruba
		"mask": "+297 ### ####",
		"placeholder": "+297 ___ ____",
		"country": "AW"
	},
	"+298": { // Faroe Islands
		"mask": "+298 ### ###",
		"placeholder": "+298 ___ ___",
		"country": "FO"
	},
	"+299": { // Greenland
		"mask": "+299 ## ## ##",
		"placeholder": "+299 __ __ __",
		"country": "GL"
	},
	"+350": { // Gibraltar
		"mask": "+350 ### #####",
		"placeholder": "+350 ___ _____",
		"country": "GI"
	},
	"+351": { // Portugal
		"mask": "+351 ### ### ###",
		"placeholder": "+351 ___ ___ ___",
		"country": "PT"
	},
	"+352": { // Luxembourg
		"mask": "+352 ### ### ###",
		"placeholder": "+352 ___ ___ ___",
		"country": "LU"
	},
	"+353": { // Ireland
		"mask": "+353 ## ### ####",
		"placeholder": "+353 __ ___ ____",
		"country": "IE"
	},
	"+354": { // Iceland
		"mask": "+354 ### ####",
		"placeholder": "+354 ___ ____",
		"country": "IS"
	},
	"+355": { // Albania
		"mask": "+355 ## ### ####",
		"placeholder": "+355 __ ___ ____",
		"country": "AL"
	},
	"+356": { // Malta
		"mask": "+356 #### ####",
		"placeholder": "+356 ____ ____",
		"country": "MT"
	},
	"+357": { // Cyprus
		"mask": "+357 ## ### ###",
		"placeholder": "+357 __ ___ ___",
		"country": "CY"
	},
	"+358": { // Finland
		"mask": "+358 ## ### ####",
		"placeholder": "+358 __ ___ ____",
		"country": "FI"
	},
	"+359": { // Bulgaria
		"mask": "+359 ### ### ###",
		"placeholder": "+359 ___ ___ ___",
		"country": "BG"
	},
	"+370": { // Lithuania
		"mask": "+370 ### #####",
		"placeholder": "+370 ___ _____",
		"country": "LT"
	},
	"+371": { // Latvia
		"mask": "+371 ## ### ###",
		"placeholder": "+371 __ ___ ___",
		"country": "LV"
	},
	"+372": { // Estonia
		"mask": "+372 #### ####",
		"placeholder": "+372 ____ ____",
		"country": "EE"
	},
	"+373": { // Moldova
		"mask": "+373 ## ### ###",
		"placeholder": "+373 __ ___ ___",
		"country": "MD"
	},
	"+374": { // Armenia
		"mask": "+374 ## ######",
		"placeholder": "+374 __ ______",
		"country": "AM"
	},
	"+375": { // Belarus
		"mask": "+375 (##) ###-##-##",
		"placeholder": "+375 (__) ___-__-__",
		"country": "BY"
	},
	"+376": { // Andorra
		"mask": "+376 ### ###",
		"placeholder": "+376 ___ ___",
		"country": "AD"
	},
	"+377": { // Monaco
		"mask": "+377 ## ### ###",
		"placeholder": "+377 __ ___ ___",
		"country": "MC"
	},
	"+378": { // San Marino
		"mask": "+378 #### ######",
		"placeholder": "+378 ____ ______",
		"country": "SM"
	},
	"+380": { // Ukraine
		"mask": "+380 (##) ###-##-##",
		"placeholder": "+380 (__) ___-__-__",
		"country": "UA"
	},
	"+381": { // Serbia
		"mask": "+381 ## ### ####",
		"placeholder": "+381 __ ___ ____",
		"country": "RS"
	},
	"+382": { // Montenegro
		"mask": "+382 ## ### ###",
		"placeholder": "+382 __ ___ ___",
		"country": "ME"
	},
	"+385": { // Croatia
		"mask": "+385 ## ### ####",
		"placeholder": "+385 __ ___ ____",
		"country": "HR"
	},
	"+386": { // Slovenia
		"mask": "+386 ## ### ###",
		"placeholder": "+386 __ ___ ___",
		"country": "SI"
	},
	"+387": { // Bosnia and Herzegovina
		"mask": "+387 ## ### ###",
		"placeholder": "+387 __ ___ ___",
		"country": "BA"
	},
	"+389": { // North Macedonia
		"mask": "+389 ## ### ###",
		"placeholder": "+389 __ ___ ___",
		"country": "MK"
	},
	"+420": { // Czech Republic
		"mask": "+420 ### ### ###",
		"placeholder": "+420 ___ ___ ___",
		"country": "CZ"
	},
	"+421": { // Slovakia
		"mask": "+421 ### ### ###",
		"placeholder": "+421 ___ ___ ___",
		"country": "SK"
	},
	"+501": { // Belize
		"mask": "+501 ### ####",
		"placeholder": "+501 ___ ____",
		"country": "BZ"
	},
	"+502": { // Guatemala
		"mask": "+502 #### ####",
		"placeholder": "+502 ____ ____",
		"country": "GT"
	},
	"+504": { // Honduras
		"mask": "+504 #### ####",
		"placeholder": "+504 ____ ____",
		"country": "HN"
	},
	"+507": { // Panama
		"mask": "+507 ###-####",
		"placeholder": "+507 ___-____",
		"country": "PA"
	},
	"+509": { // Haiti
		"mask": "+509 ## ## ####",
		"placeholder": "+509 __ __ ____",
		"country": "HT"
	},
	"+591": { // Bolivia
		"mask": "+591 ## ### ####",
		"placeholder": "+591 __ ___ ____",
		"country": "BO"
	},
	"+592": { // Guyana
		"mask": "+592 ### ####",
		"placeholder": "+592 ___ ____",
		"country": "GY"
	},
	"+593": { // Ecuador
		"mask": "+593 ## ### ####",
		"placeholder": "+593 __ ___ ____",
		"country": "EC"
	},
	"+594": { // French Guiana
		"mask": "+594 ### ### ###",
		"placeholder": "+594 ___ ___ ___",
		"country": "GF"
	},
	"+595": { // Paraguay
		"mask": "+595 ## ### ####",
		"placeholder": "+595 __ ___ ____",
		"country": "PY"
	},
	"+596": { // Martinique
		"mask": "+596 ### ## ## ##",
		"placeholder": "+596 ___ __ __ __",
		"country": "MQ"
	},
	"+597": { // Suriname
		"mask": "+597 ### ###",
		"placeholder": "+597 ___ ___",
		"country": "SR"
	},
	"+598": { // Uruguay
		"mask": "+598 ## ### ## ##",
		"placeholder": "+598 __ ___ __ __",
		"country": "UY"
	},
	"+599": { // Curaçao/Bonaire
		"mask": "+599 ### ####",
		"placeholder": "+599 ___ ____",
		"country": "CW/BQ"
	},
	"+670": { // Timor-Leste
		"mask": "+670 ## ### ####",
		"placeholder": "+670 __ ___ ____",
		"country": "TL"
	},
	"+673": { // Brunei
		"mask": "+673 ### ####",
		"placeholder": "+673 ___ ____",
		"country": "BN"
	},
	"+675": { // Papua New Guinea
		"mask": "+675 ### ### ###",
		"placeholder": "+675 ___ ___ ___",
		"country": "PG"
	},
	"+680": { // Palau
		"mask": "+680 ### ####",
		"placeholder": "+680 ___ ____",
		"country": "PW"
	},
	"+682": { // Cook Islands
		"mask": "+682 ## ###",
		"placeholder": "+682 __ ___",
		"country": "CK"
	},
	"+685": { // Samoa
		"mask": "+685 ## ####",
		"placeholder": "+685 __ ____",
		"country": "WS"
	},
	"+687": { // New Caledonia
		"mask": "+687 ## ####",
		"placeholder": "+687 __ ____",
		"country": "NC"
	},
	"+688": { // Tuvalu
		"mask": "+688 ## ####",
		"placeholder": "+688 __ ____",
		"country": "TV"
	},
	"+689": { // French Polynesia
		"mask": "+689 ## ## ##",
		"placeholder": "+689 __ __ __",
		"country": "PF"
	},
	"+692": { // Marshall Islands
		"mask": "+692 ### ####",
		"placeholder": "+692 ___ ____",
		"country": "MH"
	},
	"+855": { // Cambodia
		"mask": "+855 ## ### ###",
		"placeholder": "+855 __ ___ ___",
		"country": "KH"
	},
	"+856": { // Laos
		"mask": "+856 ## ### ###",
		"placeholder": "+856 __ ___ ___",
		"country": "LA"
	},
	"+880": { // Bangladesh
		"mask": "+880 ## ### ####",
		"placeholder": "+880 __ ___ ____",
		"country": "BD"
	},
	"+960": { // Maldives
		"mask": "+960 ### ####",
		"placeholder": "+960 ___ ____",
		"country": "MV"
	},
	"+961": { // Lebanon
		"mask": "+961 ## ### ###",
		"placeholder": "+961 __ ___ ___",
		"country": "LB"
	},
	"+962": { // Jordan
		"mask": "+962 ## ### ####",
		"placeholder": "+962 __ ___ ____",
		"country": "JO"
	},
	"+963": { // Syria
		"mask": "+963 ## ### ####",
		"placeholder": "+963 __ ___ ____",
		"country": "SY"
	},
	"+964": { // Iraq
		"mask": "+964 ### ### ####",
		"placeholder": "+964 ___ ___ ____",
		"country": "IQ"
	},
	"+965": { // Kuwait
		"mask": "+965 #### ####",
		"placeholder": "+965 ____ ____",
		"country": "KW"
	},
	"+966": { // Saudi Arabia
		"mask": "+966 ## ### ####",
		"placeholder": "+966 __ ___ ____",
		"country": "SA"
	},
	"+967": { // Yemen
		"mask": "+967 ### ### ###",
		"placeholder": "+967 ___ ___ ___",
		"country": "YE"
	},
	"+968": { // Oman
		"mask": "+968 ## ### ###",
		"placeholder": "+968 __ ___ ___",
		"country": "OM"
	},
	"+971": { // United Arab Emirates
		"mask": "+971 ## ### ####",
		"placeholder": "+971 __ ___ ____",
		"country": "AE"
	},
	"+972": { // Israel
		"mask": "+972 ##-###-####",
		"placeholder": "+972 __-___-____",
		"country": "IL"
	},
	"+973": { // Bahrain
		"mask": "+973 #### ####",
		"placeholder": "+973 ____ ____",
		"country": "BH"
	},
	"+974": { // Qatar
		"mask": "+974 #### ####",
		"placeholder": "+974 ____ ____",
		"country": "QA"
	},
	"+975": { // Bhutan
		"mask": "+975 ## ### ###",
		"placeholder": "+975 __ ___ ___",
		"country": "BT"
	},
	"+976": { // Mongolia
		"mask": "+976 ## ### ###",
		"placeholder": "+976 __ ___ ___",
		"country": "MN"
	},
	"+977": { // Nepal
		"mask": "+977 ## ### ####",
		"placeholder": "+977 __ ___ ____",
		"country": "NP"
	},
	"+992": { // Tajikistan
		"mask": "+992 ## ### ####",
		"placeholder": "+992 __ ___ ____",
		"country": "TJ"
	},
	"+993": { // Turkmenistan
		"mask": "+993 ## ### ###",
		"placeholder": "+993 __ ___ ___",
		"country": "TM"
	},
	"+994": { // Azerbaijan
		"mask": "+994 ## ### ## ##",
		"placeholder": "+994 __ ___ __ __",
		"country": "AZ"
	},
	"+995": { // Georgia
		"mask": "+995 ### ## ## ##",
		"placeholder": "+995 ___ __ __ __",
		"country": "GE"
	},
	"+996": { // Kyrgyzstan
		"mask": "+996 ### ### ###",
		"placeholder": "+996 ___ ___ ___",
		"country": "KG"
	},
	"+998": { // Uzbekistan
		"mask": "+998 ## ### ####",
		"placeholder": "+998 __ ___ ____",
		"country": "UZ"
	},
	"default": { // International/Unknown
		"mask": "+# ### ###-##-##",
		"placeholder": "+_ ___ ___-__-__",
		"country": "INT"
	}
};

/**
 * Detects the appropriate mask based on the entered value.
 * Codes are sorted by descending length so that +375 is checked before +3.
 */
export function detectPhoneMask(value) {
	const cleaned = value.replace(/\D/g, '');
	const codes = Object.keys(PHONE_MASKS)
		.filter(k => k !== 'default')
		.sort((a, b) => b.length - a.length);

	for (const code of codes) {
		const digits = code.replace(/\D/g, '');
		if (cleaned.startsWith(digits)) {
			return PHONE_MASKS[code];
		}
	}
	return PHONE_MASKS['default'];
}
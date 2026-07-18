---

excalidraw-plugin: parsed
tags: [excalidraw]

---
==⚠  Switch to EXCALIDRAW VIEW in the MORE OPTIONS menu of this document. ⚠== You can decompress Drawing data with the command palette: 'Decompress current Excalidraw file'. For more info check in plugin settings under 'Saving'


# Excalidraw Data

## Text Elements
INPUT BUSES: inputs enter on horizontal buses at the TOP - every layer, including the topmost. ^1gHyq5ZB

OUTPUT BUSES: outputs leave on horizontal buses at the BOTTOM - every layer. ^MJsp2GKf

LEFT: this node's output goes INTO the core
(one level down), so it sits on the left. ^MK1FLiz6

RIGHT: this node receives its input FROM the core,
so it sits on the right. ^OjNDFxJj

PASS-THROUGH: touches the layer but not the core.
Sits left or right, sorted so the drawing
does not get crowded. ^LsHREjJb

An input may run STRAIGHT to the core.
A core output may run straight to the output bus. ^qhZCjrwb

RULES (owner, i0027 - spec: req-onion-io-rendering):
- TOPMOST view: no inner nodes. Only the rings,
  selectable to dive one level in. Input and output
  arrows stop at the onion's OUTSIDE.
- Every layer renders the SAME as this drawing.
- The LOWEST layer is the same minus the core.
- Always a ROUND onion, core centered. Never ovals. ^QVfyFMUx

%%
## Drawing
```json
{
	"type": "excalidraw",
	"version": 2,
	"source": "https://github.com/zsviczian/obsidian-excalidraw-plugin/releases/tag2.24.2",
	"elements": [
		{
			"id": "3VAXKAGu",
			"type": "ellipse",
			"x": -94,
			"y": -139.3125,
			"width": 285,
			"height": 265,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "a0",
			"roundness": {
				"type": 2
			},
			"seed": 1610956234,
			"version": 61,
			"versionNonce": 773523210,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1784310904313,
			"link": null,
			"locked": false,
			"hasTextLink": false
		},
		{
			"id": "8l0gk0Ht",
			"type": "ellipse",
			"x": 31.414588572535465,
			"y": -24.860470331189404,
			"width": 34.17082331470465,
			"height": 36.09594012116682,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "a1",
			"roundness": {
				"type": 2
			},
			"seed": 1016614026,
			"version": 68,
			"versionNonce": 1255548950,
			"isDeleted": false,
			"boundElements": [
				{
					"id": "zUXhoPgZ",
					"type": "arrow"
				},
				{
					"id": "6qyDLnT5",
					"type": "arrow"
				},
				{
					"id": "3VJhocFD",
					"type": "arrow"
				},
				{
					"id": "K3l4zPNV",
					"type": "arrow"
				}
			],
			"updated": 1784311025828,
			"link": null,
			"locked": false,
			"hasTextLink": false
		},
		{
			"id": "FOv2iDO2",
			"type": "rectangle",
			"x": -252.08870012595372,
			"y": -182.53091121065228,
			"width": 103.05239560015343,
			"height": 35.16867468894128,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "a2",
			"roundness": {
				"type": 3
			},
			"seed": 936163914,
			"version": 39,
			"versionNonce": 682455830,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1784310928460,
			"link": null,
			"locked": false,
			"hasTextLink": false
		},
		{
			"id": "bxrt6CloecA2KUGkJLa5D",
			"type": "line",
			"x": -145.7647999035732,
			"y": -162.08400732173294,
			"width": 458.8285232673498,
			"height": 0.817876155556803,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "a3",
			"roundness": {
				"type": 2
			},
			"seed": 1656666122,
			"version": 71,
			"versionNonce": 58794442,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1784310934154,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					458.8285232673498,
					-0.817876155556803
				]
			],
			"startBinding": null,
			"endBinding": null,
			"startArrowhead": null,
			"endArrowhead": null,
			"polygon": false,
			"hasTextLink": false
		},
		{
			"id": "hIzuCqdOkXfS58iVfgnp5",
			"type": "rectangle",
			"x": -255.01088148319138,
			"y": -227.10516168849642,
			"width": 103.05239560015343,
			"height": 35.16867468894128,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "a4",
			"roundness": {
				"type": 3
			},
			"seed": 1251654166,
			"version": 88,
			"versionNonce": 1738351178,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1784310944948,
			"link": null,
			"locked": false,
			"hasTextLink": false
		},
		{
			"id": "ck7r5YVjvMyIPxgXxIbN4",
			"type": "line",
			"x": -148.68698126081074,
			"y": -206.6582577995771,
			"width": 458.8285232673498,
			"height": 0.817876155556803,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "a5",
			"roundness": {
				"type": 2
			},
			"seed": 1252460374,
			"version": 120,
			"versionNonce": 555108618,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1784310944948,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					458.8285232673498,
					-0.817876155556803
				]
			],
			"startBinding": null,
			"endBinding": null,
			"startArrowhead": null,
			"endArrowhead": null,
			"polygon": false,
			"hasTextLink": false
		},
		{
			"id": "0BqPfuipNNJbZ6rP2qGZy",
			"type": "rectangle",
			"x": -255.82875763874807,
			"y": -272.9062263996757,
			"width": 103.05239560015343,
			"height": 35.16867468894128,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "a6",
			"roundness": {
				"type": 3
			},
			"seed": 412921162,
			"version": 85,
			"versionNonce": 1160779670,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1784310949932,
			"link": null,
			"locked": false,
			"hasTextLink": false
		},
		{
			"id": "utwXZ8QVKoldaj3HeoxFY",
			"type": "line",
			"x": -149.50485741636754,
			"y": -252.45932251075635,
			"width": 458.8285232673498,
			"height": 0.817876155556803,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "a7",
			"roundness": {
				"type": 2
			},
			"seed": 1072460810,
			"version": 117,
			"versionNonce": 1437906134,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1784310949932,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					458.8285232673498,
					-0.817876155556803
				]
			],
			"startBinding": null,
			"endBinding": null,
			"startArrowhead": null,
			"endArrowhead": null,
			"polygon": false,
			"hasTextLink": false
		},
		{
			"id": "JcNlH_y5cTnzcfng5YLvW",
			"type": "rectangle",
			"x": 337.38116954417006,
			"y": 134.9567576661805,
			"width": 103.05239560015343,
			"height": 35.16867468894128,
			"angle": 3.1401248970023,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "a8",
			"roundness": {
				"type": 3
			},
			"seed": 1817484438,
			"version": 227,
			"versionNonce": 1504271702,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1784310963207,
			"link": null,
			"locked": false,
			"hasTextLink": false
		},
		{
			"id": "21O-cIs_-2lStrYhJwg6A",
			"type": "line",
			"x": -125.16564145349543,
			"y": 151.62257946164922,
			"width": 458.8285232673498,
			"height": 0.817876155556803,
			"angle": 3.1401248970023,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "a9",
			"roundness": {
				"type": 2
			},
			"seed": 268474838,
			"version": 259,
			"versionNonce": 511656598,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1784310963207,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					458.8285232673498,
					-0.817876155556803
				]
			],
			"startBinding": null,
			"endBinding": null,
			"startArrowhead": null,
			"endArrowhead": null,
			"polygon": false,
			"hasTextLink": false
		},
		{
			"id": "SwdtrQ9v0Qitt01CS4HZd",
			"type": "rectangle",
			"x": 337.54291709401843,
			"y": 177.7435353121063,
			"width": 103.05239560015343,
			"height": 35.16867468894128,
			"angle": 3.1401248970023,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aA",
			"roundness": {
				"type": 3
			},
			"seed": 1243415126,
			"version": 261,
			"versionNonce": 800380106,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1784310967100,
			"link": null,
			"locked": false,
			"hasTextLink": false
		},
		{
			"id": "FrjGUnraO23MP6n9fi6TS",
			"type": "line",
			"x": -125.00389390364705,
			"y": 194.40935710757498,
			"width": 458.8285232673498,
			"height": 0.817876155556803,
			"angle": 3.1401248970023,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aB",
			"roundness": {
				"type": 2
			},
			"seed": 1798719382,
			"version": 293,
			"versionNonce": 546548618,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1784310967100,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					458.8285232673498,
					-0.817876155556803
				]
			],
			"startBinding": null,
			"endBinding": null,
			"startArrowhead": null,
			"endArrowhead": null,
			"polygon": false,
			"hasTextLink": false
		},
		{
			"id": "tn3o0bVc-6bEA0Kk2xx2Q",
			"type": "rectangle",
			"x": 339.1786694051319,
			"y": 220.27309540105847,
			"width": 103.05239560015343,
			"height": 35.16867468894128,
			"angle": 3.1401248970023,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aC",
			"roundness": {
				"type": 3
			},
			"seed": 805773258,
			"version": 265,
			"versionNonce": 1799145750,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1784310969817,
			"link": null,
			"locked": false,
			"hasTextLink": false
		},
		{
			"id": "cYLrvMOj0J8-sEjqkXJ-J",
			"type": "line",
			"x": -123.36814159253356,
			"y": 236.93891719652714,
			"width": 458.8285232673498,
			"height": 0.817876155556803,
			"angle": 3.1401248970023,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aD",
			"roundness": {
				"type": 2
			},
			"seed": 375690890,
			"version": 297,
			"versionNonce": 1244608086,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1784310969817,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					458.8285232673498,
					-0.817876155556803
				]
			],
			"startBinding": null,
			"endBinding": null,
			"startArrowhead": null,
			"endArrowhead": null,
			"polygon": false,
			"hasTextLink": false
		},
		{
			"id": "zUXhoPgZ",
			"type": "arrow",
			"x": 52.97910589672267,
			"y": 10.487861500746192,
			"width": 2.4536284666703523,
			"height": 135.76744182242436,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aE",
			"roundness": {
				"type": 2
			},
			"seed": 16625866,
			"version": 40,
			"versionNonce": 288862218,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1784310975922,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					-2.4536284666703523,
					135.76744182242436
				]
			],
			"startBinding": {
				"elementId": "8l0gk0Ht",
				"mode": "inside",
				"fixedPoint": [
					0.6310798287060119,
					0.9792882998275803
				]
			},
			"endBinding": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false,
			"hasTextLink": false
		},
		{
			"id": "6qyDLnT5",
			"type": "arrow",
			"x": 48.88972511893883,
			"y": -162.90188347728974,
			"width": 0.3695168797920658,
			"height": 132.04142235950886,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aF",
			"roundness": {
				"type": 2
			},
			"seed": 1966653462,
			"version": 51,
			"versionNonce": 1254820182,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1784310985314,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					-0.3695168797920658,
					132.04142235950886
				]
			],
			"startBinding": null,
			"endBinding": {
				"elementId": "8l0gk0Ht",
				"mode": "orbit",
				"fixedPoint": [
					0.5001,
					0
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false,
			"hasTextLink": false
		},
		{
			"id": "j11w1YPn",
			"type": "rectangle",
			"x": -61.52355588122555,
			"y": -15.68417547707054,
			"width": 71.97310168899605,
			"height": 26.989913133373534,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aG",
			"roundness": {
				"type": 3
			},
			"seed": 2027651914,
			"version": 30,
			"versionNonce": 770571914,
			"isDeleted": false,
			"boundElements": [
				{
					"id": "GpJTAfQ0",
					"type": "arrow"
				},
				{
					"id": "3VJhocFD",
					"type": "arrow"
				}
			],
			"updated": 1784310995498,
			"link": null,
			"locked": false,
			"hasTextLink": false
		},
		{
			"id": "GpJTAfQ0",
			"type": "arrow",
			"x": -22.26550041450048,
			"y": -206.2493197217987,
			"width": 3.1615296296547157,
			"height": 184.56514424472817,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aH",
			"roundness": {
				"type": 2
			},
			"seed": 1404392726,
			"version": 35,
			"versionNonce": 1578723926,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1784310992380,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					-3.1615296296547157,
					184.56514424472817
				]
			],
			"startBinding": null,
			"endBinding": {
				"elementId": "j11w1YPn",
				"mode": "orbit",
				"fixedPoint": [
					0.5001,
					0
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false,
			"hasTextLink": false
		},
		{
			"id": "3VJhocFD",
			"type": "arrow",
			"x": 16.449545807770505,
			"y": -3.5093993835355572,
			"width": 14.96504276476496,
			"height": 3.2994912930583222,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aI",
			"roundness": {
				"type": 2
			},
			"seed": 913969738,
			"version": 46,
			"versionNonce": 689607178,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1784310998018,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					14.96504276476496,
					-3.2994912930583222
				]
			],
			"startBinding": {
				"elementId": "j11w1YPn",
				"mode": "orbit",
				"fixedPoint": [
					1,
					0.5001
				]
			},
			"endBinding": {
				"elementId": "8l0gk0Ht",
				"mode": "orbit",
				"fixedPoint": [
					0,
					0.5001
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false,
			"hasTextLink": false
		},
		{
			"id": "FBs9aakw",
			"type": "rectangle",
			"x": -83.60621208125838,
			"y": 18.666623056313938,
			"width": 70.33734937788245,
			"height": 25.35416082226004,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aJ",
			"roundness": {
				"type": 3
			},
			"seed": 2100926026,
			"version": 33,
			"versionNonce": 1892891542,
			"isDeleted": false,
			"boundElements": [
				{
					"id": "w0SVC7ht",
					"type": "arrow"
				},
				{
					"id": "zDHdbORg",
					"type": "arrow"
				}
			],
			"updated": 1784311011281,
			"link": null,
			"locked": false,
			"hasTextLink": false
		},
		{
			"id": "w0SVC7ht",
			"type": "arrow",
			"x": -58.25205125899845,
			"y": -251.23250827742123,
			"width": 6.543009244454197,
			"height": 270.7170074892919,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aK",
			"roundness": {
				"type": 2
			},
			"seed": 2061435594,
			"version": 35,
			"versionNonce": 52261258,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1784311008299,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					-6.543009244454197,
					270.7170074892919
				]
			],
			"startBinding": null,
			"endBinding": {
				"elementId": "FBs9aakw",
				"mode": "inside",
				"fixedPoint": [
					0.2674418604651157,
					0.03225806451612787
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false,
			"hasTextLink": false
		},
		{
			"id": "zDHdbORg",
			"type": "arrow",
			"x": -47.61966123676041,
			"y": 44.020783878573866,
			"width": 3.271504622227212,
			"height": 148.8534603113328,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aL",
			"roundness": {
				"type": 2
			},
			"seed": 698282966,
			"version": 58,
			"versionNonce": 1911724374,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1784311032610,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					-3.271504622227212,
					148.8534603113328
				]
			],
			"startBinding": {
				"elementId": "FBs9aakw",
				"mode": "inside",
				"fixedPoint": [
					0.5116279069767438,
					0.9999999999999956
				]
			},
			"endBinding": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false,
			"hasTextLink": false
		},
		{
			"id": "gAoLlFCS",
			"type": "rectangle",
			"x": 106.141056007913,
			"y": -15.68417547707054,
			"width": 71.97310168899594,
			"height": 23.718408511146436,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aM",
			"roundness": {
				"type": 3
			},
			"seed": 361918474,
			"version": 62,
			"versionNonce": 310628234,
			"isDeleted": false,
			"boundElements": [
				{
					"id": "K3l4zPNV",
					"type": "arrow"
				},
				{
					"id": "jpHvTmAA",
					"type": "arrow"
				}
			],
			"updated": 1784311028630,
			"link": null,
			"locked": false,
			"hasTextLink": false
		},
		{
			"id": "K3l4zPNV",
			"type": "arrow",
			"x": 71.58145683952509,
			"y": -6.3673753896503245,
			"width": 28.559599168387905,
			"height": 2.1029694944195656,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aN",
			"roundness": {
				"type": 2
			},
			"seed": 813862998,
			"version": 21,
			"versionNonce": 1166297430,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1784311026445,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					28.559599168387905,
					2.1029694944195656
				]
			],
			"startBinding": {
				"elementId": "8l0gk0Ht",
				"mode": "orbit",
				"fixedPoint": [
					1,
					0.5001
				]
			},
			"endBinding": {
				"elementId": "gAoLlFCS",
				"mode": "orbit",
				"fixedPoint": [
					0,
					0.5001
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false,
			"hasTextLink": false
		},
		{
			"id": "jpHvTmAA",
			"type": "arrow",
			"x": 141.98461559115128,
			"y": 14.034233034075896,
			"width": 5.58214182763777,
			"height": 223.00532355589655,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aO",
			"roundness": {
				"type": 2
			},
			"seed": 1515078474,
			"version": 42,
			"versionNonce": 327448586,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1784311029787,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					-5.58214182763777,
					223.00532355589655
				]
			],
			"startBinding": {
				"elementId": "gAoLlFCS",
				"mode": "orbit",
				"fixedPoint": [
					0.5001,
					1
				]
			},
			"endBinding": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false,
			"hasTextLink": false
		},
		{
			"id": "1gHyq5ZB",
			"type": "text",
			"x": -390.093518038511,
			"y": -314.12549971367446,
			"width": 670.94921875,
			"height": 17.5,
			"angle": 0,
			"strokeColor": "#1971c2",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aQ",
			"roundness": null,
			"seed": 101,
			"version": 43,
			"versionNonce": 1081294742,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1784311683555,
			"locked": false,
			"text": "INPUT BUSES: inputs enter on horizontal buses at the TOP - every layer, including the topmost.",
			"rawText": "INPUT BUSES: inputs enter on horizontal buses at the TOP - every layer, including the topmost.",
			"fontSize": 14,
			"fontFamily": 5,
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "INPUT BUSES: inputs enter on horizontal buses at the TOP - every layer, including the topmost.",
			"autoResize": true,
			"lineHeight": 1.25,
			"hasTextLink": false,
			"link": null
		},
		{
			"id": "MJsp2GKf",
			"type": "text",
			"x": -146,
			"y": 262,
			"width": 576.5333251953125,
			"height": 17.5,
			"angle": 0,
			"strokeColor": "#1971c2",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aR",
			"roundness": null,
			"seed": 102,
			"version": 1,
			"versionNonce": 102,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1784311100000,
			"locked": false,
			"text": "OUTPUT BUSES: outputs leave on horizontal buses at the BOTTOM - every layer.",
			"rawText": "OUTPUT BUSES: outputs leave on horizontal buses at the BOTTOM - every layer.",
			"fontSize": 14,
			"fontFamily": 5,
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "OUTPUT BUSES: outputs leave on horizontal buses at the BOTTOM - every layer.",
			"autoResize": true,
			"lineHeight": 1.25,
			"hasTextLink": false,
			"link": null
		},
		{
			"id": "MK1FLiz6",
			"type": "text",
			"x": -470,
			"y": -40,
			"width": 319.24163818359375,
			"height": 35,
			"angle": 0,
			"strokeColor": "#1971c2",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aS",
			"roundness": null,
			"seed": 103,
			"version": 1,
			"versionNonce": 103,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1784311100000,
			"locked": false,
			"text": "LEFT: this node's output goes INTO the core\n(one level down), so it sits on the left.",
			"rawText": "LEFT: this node's output goes INTO the core\n(one level down), so it sits on the left.",
			"fontSize": 14,
			"fontFamily": 5,
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "LEFT: this node's output goes INTO the core\n(one level down), so it sits on the left.",
			"autoResize": true,
			"lineHeight": 1.25,
			"hasTextLink": false,
			"link": null
		},
		{
			"id": "OjNDFxJj",
			"type": "text",
			"x": 200,
			"y": 30,
			"width": 358.0355529785156,
			"height": 35,
			"angle": 0,
			"strokeColor": "#1971c2",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aT",
			"roundness": null,
			"seed": 104,
			"version": 1,
			"versionNonce": 104,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1784311100000,
			"locked": false,
			"text": "RIGHT: this node receives its input FROM the core,\nso it sits on the right.",
			"rawText": "RIGHT: this node receives its input FROM the core,\nso it sits on the right.",
			"fontSize": 14,
			"fontFamily": 5,
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "RIGHT: this node receives its input FROM the core,\nso it sits on the right.",
			"autoResize": true,
			"lineHeight": 1.25,
			"hasTextLink": false,
			"link": null
		},
		{
			"id": "LsHREjJb",
			"type": "text",
			"x": -470,
			"y": 40,
			"width": 365.07757568359375,
			"height": 52.5,
			"angle": 0,
			"strokeColor": "#1971c2",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aU",
			"roundness": null,
			"seed": 105,
			"version": 1,
			"versionNonce": 105,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1784311100000,
			"locked": false,
			"text": "PASS-THROUGH: touches the layer but not the core.\nSits left or right, sorted so the drawing\ndoes not get crowded.",
			"rawText": "PASS-THROUGH: touches the layer but not the core.\nSits left or right, sorted so the drawing\ndoes not get crowded.",
			"fontSize": 14,
			"fontFamily": 5,
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "PASS-THROUGH: touches the layer but not the core.\nSits left or right, sorted so the drawing\ndoes not get crowded.",
			"autoResize": true,
			"lineHeight": 1.25,
			"hasTextLink": false,
			"link": null
		},
		{
			"id": "qhZCjrwb",
			"type": "text",
			"x": 75,
			"y": -140,
			"width": 299.219482421875,
			"height": 30,
			"angle": 0,
			"strokeColor": "#1971c2",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aV",
			"roundness": null,
			"seed": 106,
			"version": 1,
			"versionNonce": 106,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1784311100000,
			"locked": false,
			"text": "An input may run STRAIGHT to the core.\nA core output may run straight to the output bus.",
			"rawText": "An input may run STRAIGHT to the core.\nA core output may run straight to the output bus.",
			"fontSize": 12,
			"fontFamily": 5,
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "An input may run STRAIGHT to the core.\nA core output may run straight to the output bus.",
			"autoResize": true,
			"lineHeight": 1.25,
			"hasTextLink": false,
			"link": null
		},
		{
			"id": "QVfyFMUx",
			"type": "text",
			"x": 330,
			"y": -310,
			"width": 358.7076110839844,
			"height": 122.5,
			"angle": 0,
			"strokeColor": "#1971c2",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aW",
			"roundness": null,
			"seed": 107,
			"version": 1,
			"versionNonce": 107,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1784311100000,
			"locked": false,
			"text": "RULES (owner, i0027 - spec: req-onion-io-rendering):\n- TOPMOST view: no inner nodes. Only the rings,\n  selectable to dive one level in. Input and output\n  arrows stop at the onion's OUTSIDE.\n- Every layer renders the SAME as this drawing.\n- The LOWEST layer is the same minus the core.\n- Always a ROUND onion, core centered. Never ovals.",
			"rawText": "RULES (owner, i0027 - spec: req-onion-io-rendering):\n- TOPMOST view: no inner nodes. Only the rings,\n  selectable to dive one level in. Input and output\n  arrows stop at the onion's OUTSIDE.\n- Every layer renders the SAME as this drawing.\n- The LOWEST layer is the same minus the core.\n- Always a ROUND onion, core centered. Never ovals.",
			"fontSize": 14,
			"fontFamily": 5,
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "RULES (owner, i0027 - spec: req-onion-io-rendering):\n- TOPMOST view: no inner nodes. Only the rings,\n  selectable to dive one level in. Input and output\n  arrows stop at the onion's OUTSIDE.\n- Every layer renders the SAME as this drawing.\n- The LOWEST layer is the same minus the core.\n- Always a ROUND onion, core centered. Never ovals.",
			"autoResize": true,
			"lineHeight": 1.25,
			"hasTextLink": false,
			"link": null
		},
		{
			"id": "ZUbVwRyD3lMaJBloHUKwW",
			"type": "line",
			"x": 173.6705102949967,
			"y": -14.842755924304697,
			"width": 254.16721878295755,
			"height": 99.96210738719975,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aX",
			"roundness": {
				"type": 2
			},
			"seed": 1926635350,
			"version": 58,
			"versionNonce": 1324328278,
			"isDeleted": false,
			"boundElements": null,
			"updated": 1784311784734,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					254.16721878295755,
					-99.96210738719975
				]
			],
			"startBinding": null,
			"endBinding": null,
			"startArrowhead": null,
			"endArrowhead": null,
			"polygon": false
		},
		{
			"id": "I8ENb8eb0nN4-EwPJi69a",
			"type": "line",
			"x": 178.31991063858743,
			"y": 8.404245793648727,
			"width": 251.06761855389698,
			"height": 10.073700744446512,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aY",
			"roundness": {
				"type": 2
			},
			"seed": 462866570,
			"version": 40,
			"versionNonce": 1445245194,
			"isDeleted": false,
			"boundElements": null,
			"updated": 1784311788219,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					251.06761855389698,
					10.073700744446512
				]
			],
			"startBinding": null,
			"endBinding": null,
			"startArrowhead": null,
			"endArrowhead": null,
			"polygon": false
		},
		{
			"id": "R7wjwyv2",
			"type": "rectangle",
			"x": 426.28792896342395,
			"y": -114.80486331150445,
			"width": 258.8166191265482,
			"height": 136.38241007866014,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aZ",
			"roundness": {
				"type": 3
			},
			"seed": 1560317718,
			"version": 54,
			"versionNonce": 1858199382,
			"isDeleted": false,
			"boundElements": [
				{
					"id": "F9CveoRB",
					"type": "arrow"
				},
				{
					"id": "Y3YEwj39",
					"type": "arrow"
				},
				{
					"id": "pWMMZPzg",
					"type": "arrow"
				},
				{
					"id": "A5TeH0wY",
					"type": "arrow"
				},
				{
					"id": "bWF1Cvpy",
					"type": "arrow"
				}
			],
			"updated": 1784311878398,
			"link": null,
			"locked": false
		},
		{
			"id": "gRo2xMyAECnkQOl4QiS4I",
			"type": "line",
			"x": 455.73413113949834,
			"y": -97.75706205167194,
			"width": 198.37441465986922,
			"height": 1.5498001145302283,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aa",
			"roundness": {
				"type": 2
			},
			"seed": 1546379158,
			"version": 54,
			"versionNonce": 155164822,
			"isDeleted": false,
			"boundElements": null,
			"updated": 1784311795859,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					198.37441465986922,
					-1.5498001145302283
				]
			],
			"startBinding": null,
			"endBinding": null,
			"startArrowhead": null,
			"endArrowhead": null,
			"polygon": false
		},
		{
			"id": "fxjVI2pwT9kSAZ1lnwGXo",
			"type": "line",
			"x": 460.383531483089,
			"y": -88.45826136449057,
			"width": 191.40031414448333,
			"height": 2.324700171795371,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "ab",
			"roundness": {
				"type": 2
			},
			"seed": 2140664138,
			"version": 76,
			"versionNonce": 1347775690,
			"isDeleted": false,
			"boundElements": null,
			"updated": 1784311801694,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					191.40031414448333,
					2.324700171795371
				]
			],
			"startBinding": null,
			"endBinding": null,
			"startArrowhead": null,
			"endArrowhead": null,
			"polygon": false
		},
		{
			"id": "x7QV_vc00N7QjMRbyicax",
			"type": "line",
			"x": 458.8337313685588,
			"y": 9.954045908178955,
			"width": 194.49991437354367,
			"height": 1.5498001145302283,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "ac",
			"roundness": {
				"type": 2
			},
			"seed": 1859084118,
			"version": 52,
			"versionNonce": 1669316054,
			"isDeleted": false,
			"boundElements": null,
			"updated": 1784311805767,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					194.49991437354367,
					-1.5498001145302283
				]
			],
			"startBinding": null,
			"endBinding": null,
			"startArrowhead": null,
			"endArrowhead": null,
			"polygon": false
		},
		{
			"id": "pLDVA-ZS1h723dFJI5z_6",
			"type": "line",
			"x": 461.93333159761926,
			"y": -0.11965483626750029,
			"width": 187.52581385815756,
			"height": 0,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "ad",
			"roundness": {
				"type": 2
			},
			"seed": 730634250,
			"version": 48,
			"versionNonce": 877278858,
			"isDeleted": false,
			"boundElements": null,
			"updated": 1784311810271,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					187.52581385815756,
					0
				]
			],
			"startBinding": null,
			"endBinding": null,
			"startArrowhead": null,
			"endArrowhead": null,
			"polygon": false
		},
		{
			"id": "wwjbPhyi",
			"type": "rectangle",
			"x": 437.1365297651356,
			"y": -105.50606262432308,
			"width": 22.47210166068828,
			"height": 10.073700744446512,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "ae",
			"roundness": {
				"type": 3
			},
			"seed": 1746764182,
			"version": 18,
			"versionNonce": 974661846,
			"isDeleted": false,
			"boundElements": null,
			"updated": 1784311814755,
			"link": null,
			"locked": false
		},
		{
			"id": "747eEpAz",
			"type": "rectangle",
			"x": 438.6863298796658,
			"y": -90.0080614790208,
			"width": 24.021901775218566,
			"height": 7.749000572651198,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "af",
			"roundness": {
				"type": 3
			},
			"seed": 183006794,
			"version": 24,
			"versionNonce": 2012256074,
			"isDeleted": false,
			"boundElements": null,
			"updated": 1784311819154,
			"link": null,
			"locked": false
		},
		{
			"id": "ikqDkHk9",
			"type": "rectangle",
			"x": 651.008945570307,
			"y": -7.868655408918642,
			"width": 25.571701889748965,
			"height": 9.29880068718137,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "ag",
			"roundness": {
				"type": 3
			},
			"seed": 362618774,
			"version": 24,
			"versionNonce": 1396649622,
			"isDeleted": false,
			"boundElements": null,
			"updated": 1784311822765,
			"link": null,
			"locked": false
		},
		{
			"id": "krOFOZjb",
			"type": "rectangle",
			"x": 651.7838456275723,
			"y": 6.079545621853413,
			"width": 24.796801832483652,
			"height": 10.848600801711598,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "ah",
			"roundness": {
				"type": 3
			},
			"seed": 1315759242,
			"version": 18,
			"versionNonce": 136599882,
			"isDeleted": false,
			"boundElements": null,
			"updated": 1784311826568,
			"link": null,
			"locked": false
		},
		{
			"id": "jMlulLx4",
			"type": "rectangle",
			"x": 454.95923108223315,
			"y": -61.336759360211545,
			"width": 54.243004008558046,
			"height": 21.697201603423196,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "ai",
			"roundness": {
				"type": 3
			},
			"seed": 757251478,
			"version": 32,
			"versionNonce": 703661834,
			"isDeleted": false,
			"boundElements": [
				{
					"id": "F9CveoRB",
					"type": "arrow"
				},
				{
					"id": "Y3YEwj39",
					"type": "arrow"
				},
				{
					"id": "kIOWr4Ut",
					"type": "arrow"
				}
			],
			"updated": 1784311867803,
			"link": null,
			"locked": false
		},
		{
			"id": "5sU3OjMs",
			"type": "rectangle",
			"x": 523.1504361215632,
			"y": -59.012059188416174,
			"width": 65.86650486753467,
			"height": 25.571701889748738,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aj",
			"roundness": {
				"type": 3
			},
			"seed": 1143591318,
			"version": 31,
			"versionNonce": 288030858,
			"isDeleted": false,
			"boundElements": [
				{
					"id": "pWMMZPzg",
					"type": "arrow"
				},
				{
					"id": "A5TeH0wY",
					"type": "arrow"
				},
				{
					"id": "kIOWr4Ut",
					"type": "arrow"
				}
			],
			"updated": 1784311873618,
			"link": null,
			"locked": false
		},
		{
			"id": "dvVtldaM",
			"type": "rectangle",
			"x": 603.7400420771352,
			"y": -52.037958673030175,
			"width": 60.44220446667896,
			"height": 18.59760137436274,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "ak",
			"roundness": {
				"type": 3
			},
			"seed": 1916401674,
			"version": 30,
			"versionNonce": 672950806,
			"isDeleted": false,
			"boundElements": [
				{
					"id": "bWF1Cvpy",
					"type": "arrow"
				}
			],
			"updated": 1784311876453,
			"link": null,
			"locked": false
		},
		{
			"id": "F9CveoRB",
			"type": "arrow",
			"x": 481.7803607767435,
			"y": -33.63955775678835,
			"width": 2.0243278620267233,
			"height": 39.719103378641776,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "al",
			"roundness": {
				"type": 2
			},
			"seed": 4432906,
			"version": 51,
			"versionNonce": 1436134794,
			"isDeleted": false,
			"boundElements": null,
			"updated": 1784311842353,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					-2.0243278620267233,
					39.719103378641776
				]
			],
			"startBinding": {
				"elementId": "jMlulLx4",
				"mode": "orbit",
				"fixedPoint": [
					0.5001,
					1
				]
			},
			"endBinding": {
				"elementId": "R7wjwyv2",
				"mode": "inside",
				"fixedPoint": [
					0.20658682634730524,
					0.8863636363636365
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false
		},
		{
			"id": "Y3YEwj39",
			"type": "arrow",
			"x": 492.9293338882238,
			"y": -96.9821619944068,
			"width": 3.874500286325542,
			"height": 37.19520274872548,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "am",
			"roundness": {
				"type": 2
			},
			"seed": 760412118,
			"version": 31,
			"versionNonce": 1672150358,
			"isDeleted": false,
			"boundElements": null,
			"updated": 1784311846717,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					3.874500286325542,
					37.19520274872548
				]
			],
			"startBinding": {
				"elementId": "R7wjwyv2",
				"mode": "inside",
				"fixedPoint": [
					0.2574850299401199,
					0.13068181818181834
				]
			},
			"endBinding": {
				"elementId": "jMlulLx4",
				"mode": "inside",
				"fixedPoint": [
					0.7714285714285717,
					0.07142857142857142
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false
		},
		{
			"id": "pWMMZPzg",
			"type": "arrow",
			"x": 541.748037495926,
			"y": -87.68336130722543,
			"width": 0,
			"height": 29.446202176074337,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "an",
			"roundness": {
				"type": 2
			},
			"seed": 1234718538,
			"version": 32,
			"versionNonce": 2083276938,
			"isDeleted": false,
			"boundElements": null,
			"updated": 1784311851735,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					0,
					29.446202176074337
				]
			],
			"startBinding": {
				"elementId": "R7wjwyv2",
				"mode": "inside",
				"fixedPoint": [
					0.44610778443113797,
					0.1988636363636365
				]
			},
			"endBinding": {
				"elementId": "5sU3OjMs",
				"mode": "inside",
				"fixedPoint": [
					0.2823529411764724,
					0.030303030303029225
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false
		},
		{
			"id": "A5TeH0wY",
			"type": "arrow",
			"x": 560.3456388702888,
			"y": -99.30686216620217,
			"width": 3.62172904908698,
			"height": 34.294802977786006,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "ao",
			"roundness": {
				"type": 2
			},
			"seed": 133672150,
			"version": 37,
			"versionNonce": 885832150,
			"isDeleted": false,
			"boundElements": null,
			"updated": 1784311864551,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					-3.62172904908698,
					34.294802977786006
				]
			],
			"startBinding": {
				"elementId": "R7wjwyv2",
				"mode": "inside",
				"fixedPoint": [
					0.5179640718562877,
					0.11363636363636359
				]
			},
			"endBinding": {
				"elementId": "5sU3OjMs",
				"mode": "orbit",
				"fixedPoint": [
					0.5001,
					0
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false
		},
		{
			"id": "kIOWr4Ut",
			"type": "arrow",
			"x": 508.4273350335261,
			"y": -46.61365827217435,
			"width": 17.047801259832454,
			"height": 1.5498001145302283,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "ap",
			"roundness": {
				"type": 2
			},
			"seed": 958941898,
			"version": 117,
			"versionNonce": 1305659850,
			"isDeleted": false,
			"boundElements": null,
			"updated": 1784311873618,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					17.047801259832454,
					-1.5498001145302283
				]
			],
			"startBinding": {
				"elementId": "jMlulLx4",
				"mode": "inside",
				"fixedPoint": [
					0.9857142857142862,
					0.6785714285714299
				]
			},
			"endBinding": {
				"elementId": "5sU3OjMs",
				"mode": "inside",
				"fixedPoint": [
					0.03529411764705927,
					0.4242424242424247
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false
		},
		{
			"id": "bWF1Cvpy",
			"type": "arrow",
			"x": 630.086644024149,
			"y": -33.440357298667436,
			"width": 4.649400343590742,
			"height": 31.770902347869708,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aq",
			"roundness": {
				"type": 2
			},
			"seed": 4297302,
			"version": 36,
			"versionNonce": 1328583190,
			"isDeleted": false,
			"boundElements": null,
			"updated": 1784311878398,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					-4.649400343590742,
					31.770902347869708
				]
			],
			"startBinding": {
				"elementId": "dvVtldaM",
				"mode": "inside",
				"fixedPoint": [
					0.43589743589743457,
					1
				]
			},
			"endBinding": {
				"elementId": "R7wjwyv2",
				"mode": "inside",
				"fixedPoint": [
					0.7694610778443111,
					0.8295454545454546
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false
		}
	],
	"appState": {
		"theme": "light",
		"viewBackgroundColor": "#ffffff",
		"currentItemStrokeColor": "#1e1e1e",
		"currentItemBackgroundColor": "transparent",
		"currentItemFillStyle": "solid",
		"currentItemStrokeWidth": 2,
		"currentItemStrokeStyle": "solid",
		"currentItemRoughness": 1,
		"currentItemOpacity": 100,
		"currentItemFontFamily": 5,
		"currentItemFontSize": 20,
		"currentItemTextAlign": "left",
		"currentItemStartArrowhead": null,
		"currentItemEndArrowhead": "arrow",
		"currentItemArrowType": "round",
		"currentItemFrameRole": null,
		"scrollX": 500.49253952565266,
		"scrollY": 426.60527385355476,
		"zoom": {
			"value": 1.290489
		},
		"currentItemRoundness": "round",
		"gridSize": 20,
		"gridStep": 5,
		"gridModeEnabled": false,
		"gridColor": {
			"Bold": "rgba(217, 217, 217, 0.5)",
			"Regular": "rgba(230, 230, 230, 0.5)"
		},
		"currentStrokeOptions": null,
		"frameRendering": {
			"enabled": true,
			"clip": true,
			"name": true,
			"outline": true,
			"markerName": true,
			"markerEnabled": true
		},
		"objectsSnapModeEnabled": false,
		"activeTool": {
			"type": "selection",
			"customType": null,
			"locked": false,
			"fromSelection": false,
			"lastActiveTool": null
		},
		"disableContextMenu": false,
		"bindingPreference": "enabled",
		"isBindingEnabled": true,
		"isMidpointSnappingEnabled": true,
		"boxSelectionMode": "contain"
	},
	"files": {}
}
```
%%
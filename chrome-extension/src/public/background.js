chrome.runtime.onInstalled.addListener(async () => {
	for (const cs of chrome.runtime.getManifest().content_scripts) {
		for (const tab of await chrome.tabs.query({ 
			discarded: false, 
			status: "complete", 
			url: cs.matches 
		})) {
			console.log('adding script from install')
			console.log(tab)
			chrome.scripting.executeScript({
				target: { tabId: tab.id, allFrames: true },
				files: ['contentscript.js']
			}).catch((err) => {
				console.log(err, tab)
			})
		}
	}
})

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
	let tabId;
	await chrome.tabs.query({ currentWindow: true, active: true }).then(res => {
		tabId = res[0]
	});

	const newMessage = JSON.parse(message)
	if (newMessage.message === 'remixDetected') {
		chrome.action.setIcon({
			tabId: tabId.id, path: {
				48: 'icons/logo48.png',
				128: 'icons/logo128.png',
				256: 'icons/logo256.png'
			}
		})
	}

	if (newMessage.message === 'panelOpen') {
		chrome.tabs.query({ currentWindow: true, active: true }).then(res => {
			if (res.length === 1) {
				chrome.tabs.sendMessage(res[0].id, JSON.stringify({ message: "runScript" }))
					.catch((err) => {
						//on install no listener is attached, tab must be reloaded
						chrome.tabs.reload(res[0].id)
			}); }
		});
	}
})

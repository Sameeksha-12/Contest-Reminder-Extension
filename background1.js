// background.js

// Listen for messages from the popup script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Received message in background.js:', message);
    if (message.action === 'updateNotifications') {
        updateAlarms();
    }
});

// Function to update alarms based on saved notifications
async function updateAlarms() {

    chrome.storage.local.get('notifications',(result) => {
        const notifications = result.notifications || {};
        console.log('Stored Notifications: ', notifications);

        chrome.alarms.clearAll(() => {
            for (const contestId in notifications) {
                const contest = notifications[contestId];
                if (contest && contest.start) {
                    // const alarmTime = Date.now() + 1*60000;
                    const alarmTime = new Date(contest.start).getTime() - 5*60*1000;
                    console.log(`Setting alarm for contest ${contest.event} at ${new Date(alarmTime).toLocaleString()}`);
                    chrome.alarms.create(contestId, {when: alarmTime});
                }
            }
        });
    });
}



// Listener for alarms
chrome.alarms.onAlarm.addListener((alarm) => {
    console.log('Alarm triggered for contest:', alarm.name);
    // Retrieve notifications again to get the contest details
    chrome.storage.local.get('notifications', (result) => {
        const notifications = result.notifications || {};
        const contest = notifications[alarm.name];
        if (contest) {
            chrome.notifications.create(alarm.name, {
                type: 'basic',
                iconUrl: 'images/atcoder.png',
                title: 'Contest Reminder',
                message: `The contest "${contest.event}" is starting soon!`
            });
        }
    });
});
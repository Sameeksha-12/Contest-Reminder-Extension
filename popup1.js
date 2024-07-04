// Platform mappings to their respective URLs
const platformMapping = {
    'codeforces': 'codeforces.com',
    'codechef': 'codechef.com',
    'atcoder': 'atcoder.jp',
    'leetcode': 'leetcode.com',
    'codingninjas': 'codingninjas.com/codestudio',
    'hackerearth': 'hackerearth.com',
    'gfg': 'geeksforgeeks.org',
    'topcoder': 'topcoder.com'
};
  
// image mappings to the urls
const imageMapping = {
    'codeforces.com': 'codeforces',
    'codechef.com': 'codechef',
    'atcoder.jp': 'atcoder',
    'leetcode.com': 'leetcode',
    'codingninjas.com/codestudio': 'codingNinja',
    'hackerearth.com': 'HackerEarth',
    'geeksforgeeks.org': 'GeeksforGeeks',
    'topcoder.com': 'topcoder'
};

document.addEventListener('DOMContentLoaded', () => {
    // Initialize by opening the first tab
    openTab('platforms');

    // Add event listeners to tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (event) => {
            openTab(event.target.getAttribute('data-tab'));
        });
    });

    // Add event listener to save platforms button
    document.getElementById('save-platforms').addEventListener('click', savePlatforms);

    // Load saved platforms
    loadSavedPlatforms();
});

// Function to open tabs
function openTab(tabName) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.style.display = 'none');
    
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.style.display = 'block';
    }
}

// Function to load saved platforms
function loadSavedPlatforms() {
    const savedPlatforms = JSON.parse(localStorage.getItem('selectedPlatforms')) || [];
    savedPlatforms.forEach(platform => {
        const checkbox = document.getElementById(platform);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
}

// Function to save selected platforms
function savePlatforms() {
    const selectedPlatforms = [];
    const platformIds = ['codeforces', 'codechef', 'leetcode', 'gfg', 'codingninjas', 'hackerearth'];
    
    platformIds.forEach(platformId => {
        if (document.getElementById(platformId).checked) {
            selectedPlatforms.push(platformId);
        }
    });

    localStorage.setItem('selectedPlatforms', JSON.stringify(selectedPlatforms));
    alert('Selected platforms saved successfully!');
}

// Fetch and display contests when the "Contests" tab is open
document.querySelector('[data-tab="contests"]').addEventListener('click', loadContests);

// Fetch and display notifications when the "Notifications" tab is open
document.querySelector('[data-tab="notifications"]').addEventListener('click', loadNotifications);

//api details
const CLIST_API_URL = 'https://clist.by/api/v4/json/contest/';
const USERNAME = 'sameeksha';
const API_KEY = 'f4f602335c6ec86cc6e3295e7b404f06925a131e';

// Function to fetch upcoming contests from CLIST API
async function fetchContests() {
  try {
    var curr_time = new Date();
    const curr_time_api_temp = curr_time.toISOString().substring(0, 11) + curr_time.toISOString().substring(11, 19);

    const now = new Date().toISOString();
    const weekLater = new Date(Date.now() + 7*24*60*60*1000).toISOString();
    const selectedPlatforms = JSON.parse(localStorage.getItem('selectedPlatforms')) || [];

    const url = new URL(CLIST_API_URL)
    url.searchParams.set('username', USERNAME);
    url.searchParams.set('api_key',API_KEY);
    url.searchParams.set('end__gt',curr_time_api_temp);
    url.searchParams.set('start__lt', weekLater);
    url.searchParams.set('limit', 100); 

    // If platforms are selected, construct the hosts string from platformMapping
    if (selectedPlatforms.length > 0) {
      const hosts = selectedPlatforms.map(platform => platformMapping[platform]).join(','); // URL-encoded comma
      url.searchParams.set('resource', hosts);
    }
    console.log('Selected Platforms:', selectedPlatforms);

    console.log('API URL:', url.toString());

    const response = await fetch(url.toString());
    const data = await response.json();
    return data.objects;
  } catch (error) {
    console.error('Error fetching contests from CLIST: ', error);
    return [];
  }
}

// Load contests when the "Contests" tab is open
async function loadContests() {
    try {
      const contests = await fetchContests();
      chrome.storage.local.set({ contests: contests });
      const contestListDiv = document.getElementById('contestList');
      contestListDiv.innerHTML = '';
  
      if (!contests || contests.length === 0) {
        contestListDiv.innerHTML = '<p>No upcoming contests found.</p>';
      } else {
        chrome.storage.local.get('notifications',(result) => {
          const storedNotifications = result.notifications || {};
          contests.forEach(contest => {
  
            // create a contest card
            const contestCard = document.createElement('div');
            contestCard.className = 'contest-card';
            contestCard.addEventListener('click',() => {
              window.open(contest.href, '_blank');
            });
    
            // create a contest details container that contains the logoImg and contestdetailsdiv
            const contestDetailsContainer = document.createElement('div');
            contestDetailsContainer.className = 'contest-details-container';
    
            const contestDetailsDiv = document.createElement('div');
            contestDetailsDiv.classList.add('contest-details');
    
            // create logo element
            const resourceKey = imageMapping[contest.resource] || contest.resource.split('.')[0];
            const logoImg = document.createElement('img');
            logoImg.src = `images/${resourceKey}.png`;
            logoImg.alt = contest.resource;
            logoImg.classList.add('contest-logo')
    
            //Add contest name
            const eventName = document.createElement('div');
            eventName.className = 'contest-event-name';
            eventName.textContent = contest.event;
    
            // Add contest start time
            const eventStart = document.createElement('div');
            eventStart.className = 'contest-event-name'
            eventStart.textContent = `Start: ${new Date(contest.start).toLocaleString()}`;
    
            // Add contest Duration
            const eventDuration = document.createElement('div');
            eventDuration.className = 'contest-event-duration';
            const duration = new Date(contest.end) - new Date(contest.start);
            const hours = Math.floor(duration / (1000 * 60 * 60));
            const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
            eventDuration.textContent = `Duration: ${hours}h ${minutes}m`;
    
            // Add Font Awesome alarm icon
            const alarmIcon = document.createElement('i');
            alarmIcon.className = 'fas alarm-icon';
    
            alarmIcon.addEventListener('click', (event) => {
              event.stopPropagation();
            });
    
            if (storedNotifications[contest.id]) {
              alarmIcon.classList.add('fa-check');
            } else {
              alarmIcon.classList.add('fa-bell');
            }
    
            alarmIcon.addEventListener('click', () => {
              toggleNotification(alarmIcon,contest);
            });
    
            contestDetailsDiv.appendChild(eventName);
            contestDetailsDiv.appendChild(eventStart);
            contestDetailsDiv.appendChild(eventDuration);
    
            contestDetailsContainer.appendChild(logoImg);
            contestDetailsContainer.appendChild(contestDetailsDiv);
            
            contestCard.appendChild(contestDetailsContainer);
            contestCard.appendChild(alarmIcon);
    
            contestListDiv.appendChild(contestCard);
          });
        });
      }  
    } catch (error) {
      console.error('Error loading contests: ', error);
      const contestListDiv = document.getElementById('contestList');
      contestListDiv.innerHTML = '<p>Error loading contests. Please try again Later.</p>';
    }
  };

  function toggleNotification(alarmIcon, contest) {
    chrome.storage.local.get('notifications', (result) => {
        const storedNotifications = result.notifications || {};

        if (alarmIcon.classList.contains('fa-bell')) {
            alarmIcon.classList.remove('fa-bell');
            alarmIcon.classList.add('fa-check');
            storedNotifications[contest.id] = {
                id: contest.id,
                event: contest.event,
                start: contest.start
            };
            alert(`Notification set for contest: ${contest.event}`);
        } else {
            alarmIcon.classList.remove('fa-check');
            alarmIcon.classList.add('fa-bell');
            delete storedNotifications[contest.id];
            alert(`Notification removed for contest: ${contest.event}`);
        }

        chrome.storage.local.set({ notifications: storedNotifications }, () => {
            console.log('Updated Notifications:', storedNotifications);
            chrome.runtime.sendMessage({ action: 'updateNotifications' });
        });
    });
}

// Function to fetch contests from local storage (used by the background script)
// function fetchContestsFromStorage() {
//   return new Promise((resolve) => {
//       chrome.storage.local.get('contests', (result) => {
//           resolve(result.contests || []);
//       });
//   });
// }

// Function to load and display notifications
// async function loadNotifications() {
//     try {
//       const result = await fetchContestsFromStorage();
//       const storedNotifications = result.notifications || {};
//       // const storedNotifications = JSON.parse(localStorage.getItem('notifications')) || {};
  
//       const contests = await fetchContests();
//       const notificationListDiv = document.getElementById('notificationList');
//       notificationListDiv.innerHTML = '';
  
//       const contestsWithNotifications = contests.filter(contest => storedNotifications[contest.id]);
  
//       if (contestsWithNotifications.length === 0) {
//         notificationListDiv.innerHTML = '<p>No notifications set for upcoming contests.</p>';
//       } else {
//         contestsWithNotifications.forEach(contest => {
//           const contestCard = document.createElement('div');
//           contestCard.className = 'contest-card';
//           contestCard.addEventListener('click', () => window.open(contest.href, '_blank'));
  
//           const contestDetailsContainer = document.createElement('div');
//           contestDetailsContainer.className = 'contest-details-container';
  
//           const contestDetailsDiv = document.createElement('div');
//           contestDetailsDiv.className = 'contest-details';
  
//           // Logo element
//           const resourceKey = imageMapping[contest.resource] || contest.resource.split('.')[0];
//           const logoImg = document.createElement('img');
//           logoImg.src = `images/${resourceKey}.png`;
//           logoImg.alt = contest.resource;
//           logoImg.classList.add('contest-logo');
  
//           // Event name
//           const eventName = document.createElement('div');
//           eventName.className = 'contest-event-name';
//           eventName.textContent = contest.event;
  
//           // Start time
//           const eventStart = document.createElement('div');
//           eventStart.className = 'contest-event-start';
//           eventStart.textContent = `Start: ${new Date(contest.start).toLocaleString()}`;
  
//           // Duration
//           const eventDuration = document.createElement('div');
//           eventDuration.className = 'contest-event-duration';
//           const duration = new Date(contest.end) - new Date(contest.start);
//           const hours = Math.floor(duration / (1000 * 60 * 60));
//           const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
//           eventDuration.textContent = `Duration: ${hours}h ${minutes}m`;
  
//           contestDetailsDiv.appendChild(eventName);
//           contestDetailsDiv.appendChild(eventStart);
//           contestDetailsDiv.appendChild(eventDuration);
  
//           contestDetailsContainer.appendChild(logoImg);
//           contestDetailsContainer.appendChild(contestDetailsDiv);
  
//           contestCard.appendChild(contestDetailsContainer);
  
//           notificationListDiv.appendChild(contestCard);
//         });
//       }
//     } catch (error) {
//       console.error('Error loading notifications: ', error);
//       const notificationListDiv = document.getElementById('notificationList');
//       notificationListDiv.innerHTML = '<p>Error loading notifications. Please try again later.</p>';
//     }
//   };  
// Function to load notifications in the Notifications tab
function loadNotifications() {
  chrome.storage.local.get('notifications', (result) => {
      const storedNotifications = result.notifications || {};
      const notificationListDiv = document.getElementById('notificationList');
      notificationListDiv.innerHTML = '';

      if (Object.keys(storedNotifications).length === 0) {
          notificationListDiv.innerHTML = '<p>No notifications set.</p>';
      } else {
          for (const [id, contest] of Object.entries(storedNotifications)) {
              const notificationDiv = document.createElement('div');
              notificationDiv.className = 'notification-item';

              const eventName = document.createElement('div');
              eventName.className = 'notification-event-name';
              eventName.textContent = contest.event;

              const eventStart = document.createElement('div');
              eventStart.className = 'notification-event-start';
              eventStart.textContent = `Start: ${new Date(contest.start).toLocaleString()}`;

              notificationDiv.appendChild(eventName);
              notificationDiv.appendChild(eventStart);

              notificationListDiv.appendChild(notificationDiv);
          }
      }
  });
}

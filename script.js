// toggle switch to (de)activate extension
const toggleSwitch = document.getElementById("toggleSwitch");

// getting the saved state of the toggle
chrome.storage.sync.get(["ext_on"], async function (items) {
  if (chrome.runtime.lastError) {
    console.error(chrome.runtime.lastError);
    return;
  }

  toggleSwitch.checked = items.ext_on != false;

  toggleContent(toggleSwitch.checked);

  var tab = await getCurrentTab();
  await getDomElements(tab, toggleSwitch.checked);
});


const toggleContent = (isChecked) => {
  const pluginWindow = document.getElementById("plugin-window");
  const content = document.getElementById("content");
  const welcome = document.getElementById("welcome");
  const footer = document.getElementById("footer");
  const inputDialog = document.getElementById("input-dialog");


  if (isChecked) {
    pluginWindow.style.backgroundColor = "#fafafa";
    content.style.display = "block";
    welcome.style.display = "none";
    footer.style.color = "#000000";
    inputDialog.style.display = "none";
  } else {
    pluginWindow.style.backgroundColor = "#004D23";
    content.style.display = "none";
    welcome.style.display = "flex";
    footer.style.color = "#ffffff";
    inputDialog.style.display = "none";
  }
};

// listening to changes to the toggle switch
toggleSwitch.addEventListener("change", async () => {
  const isChecked = toggleSwitch.checked;

  toggleContent(isChecked);

  var tab = await getCurrentTab();
  await getDomElements(tab, isChecked);

  chrome.storage.sync.set({
    ext_on: isChecked,
    function() {},
  });
});

// get the current active tab to run script on it
async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  try {
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  } catch (error) {
    console.error(error);
  }
}

// runs the content.js or revert.js file on the current tab
const getDomElements = async (tab, shouldReplace) => {
  if (!tab && !tab.id) {
    return;
  }
  try {
    let fileName = shouldReplace === true ? "content.js" : "revert.js";

    await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      files: [fileName],
    });
  } catch (error) {
    console.log(error);
  }
};

// Attach the function to the global object (window in a browser, global in Node.js)
if (typeof window !== "undefined") {
  window.getCurrentTab = getCurrentTab;
} else if (typeof global !== "undefined") {
  global.getDomElements = getDomElements;
}
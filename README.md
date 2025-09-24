# DESCRIPTION
This is a Vanilla JS Component to allow you to select an image (drag & drop / select file), crop it to a square and allow the user to move (mouse + touch) it before cropping; and save it to your app using api calls.

[You can see it in action here.](https://plnkr.co/plunk/dsFhprkuTFIz1X1k) Please note that it manipulates images in javascript and if you upload big images it can be slow.

# USAGE
```javascript

// get the elements that will contains it
const targetEl = document.querySelector("div#avatarContainer");

// get it's rendered size (in pixels)
const contOffset = targetEl.getBoundingClientRect();

// get the width
const width = Math.round(contOffset.width);

// construct the component
cconst avatarSelector = new AvatarSelector(targetEl, width, width);

// listen to events. 
avatarSelector.addEventListener(AvatarSelector.imageAvailable, imageAvailable);
avatarSelector.addEventListener(AvatarSelector.imageUpdated, imageUpdated);

```

# EVENTS
### imageAvailable
This event is fired once the image is available.

### imageUpdated
This ievent is fired when the user moves the image in the component, for cropping.

# FUNCTIONS
### getImageData()
This function returns a base64 encoded version of the final image (after resize and cropping). It is saved as a JPG from the CANVAS element.

# CREDITS
I developed it while working on Troove.

[![alt text](https://troove.app/favicon-192x192.png "Troove Logo")](https://troove.app/music-events/montreal-qc)

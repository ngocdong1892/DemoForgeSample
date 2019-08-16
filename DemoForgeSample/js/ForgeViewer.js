var viewer;
let dbIds;
let color;
var dbId = 0;
function getAllDbIds(viewer) {
    var instanceTree = viewer.model.getData().instanceTree;

    var allDbIdsStr = Object.keys(instanceTree.nodeAccess.dbIdToIndex);

    return allDbIdsStr.map(function (id) {
        return parseInt(id);
    });
}

function launchViewer(urn) {
    //console.log('urn: ', urn);
    var options = {
        env: 'AutodeskProduction',
        getAccessToken: getForgeToken,
    };

    //Autodesk.Viewing.Initializer(options, () => {
    //    //debugger;
    //    viewer = new Autodesk.Viewing.ViewingApplication(document.getElementById('forgeViewer'));
    //    debugger;
    //    viewer.registerViewer(
    //        viewer.k3D,
    //        Autodesk.Viewing.Private.GuiViewer3D
    //    );
    //    //console.log(viewer);
    //    viewer.start();
    //    var documentId = 'urn:' + urn;
    //    Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
    //    // Register color extention
    //    viewer.registerViewer(viewer.k3D, Autodesk.Viewing.Private.GuiViewer3D, { extensions: ['MyColorExtension'] });
    //});
    // Run this when the page is loaded

    var documentId = 'urn:' + urn;
    Autodesk.Viewing.Initializer(options, function onInitialized() {
        viewer = new Autodesk.Viewing.ViewingApplication('forgeViewer');
        viewer.registerViewer(
            viewer.k3D,
            Autodesk.Viewing.Private.GuiViewer3D
        );
        viewer.loadDocument(
            documentId,
            onDocumentLoadSuccess,
            onDocumentLoadFailure
        );
        // Register color extention
        viewer.registerViewer(
            viewer.k3D,
            Autodesk.Viewing.Private.GuiViewer3D,
            { extensions: ['MyColorExtension'] }
        );
    });
}

//function onDocumentLoadSuccess(doc) {
//    var viewables = doc.getRoot().getDefaultGeometry();
//    viewer.loadDocumentNode(doc, viewables).then(i => {
//        // documented loaded, any action?

//    });
//}

function onDocumentLoadSuccess(doc) {
    // We could still make use of Document.getSubItemsWithProperties()
    // However, when using a ViewingApplication, we have access to the **bubble** attribute,
    // which references the root node of a graph that wraps each object from the Manifest JSON.
    //debugger;
    var viewables = viewer.bubble.search({ type: 'geometry' });
    if (viewables.length === 0) {
        console.error('Document contains no viewables.');
        return;
    }
    viewer.selectItem(
        viewables[0].data,
        onItemLoadSuccess,
        onItemLoadFail
    );
}

function onItemLoadFail(viewerErrorCode) {
    console.error('onLoadModelError() - errorCode:' + viewerErrorCode);
    jQuery('#forgeViewer').html(
        '<p>There is an error fetching the translated SVF file. Please try refreshing the page.</p>'
    );
}

function onDocumentLoadFailure(viewerErrorCode) {
    console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}

function getForgeToken(callback) {
    fetch('/api/forge/oauth/token').then(res => {
        res.json().then(data => {
            callback(data.access_token, data.expires_in);
        });
    });
}

function onItemLoadSuccess(viewer, item) {

    // Congratulations! The viewer is now ready to be used.

    viewer.addEventListener(
        Autodesk.Viewing.SELECTION_CHANGED_EVENT,
        function (e) {
            if (e.dbIdArray.length) {
                dbId = e.dbIdArray[0];
                // console.log('DbId: ' + dbId);
                // viewer.setThemingColor(dbId, new THREE.Vector4(0, 1, 1, 1));
                // viewer.setThemingColor(dbId, new THREE.Vector4(1, 0, 0, 0.5));
                //if (color) {
                //    debugger;
                //    viewer.setThemingColor(dbId, color);
                //}
            }
        }
    );
    viewer.addEventListener(
        Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
        function (e) {
            dbIds = getAllDbIds(viewer);
        }
    );

    // Used in blog post http://adndevblog.typepad.com/cloud_and_mobile/2016/10/get-all-database-ids-in-the-model.html
    //setTimeout(() => {
    //    dbIds = getAllDbIds(viewer);
    //    console.log('dbIds: ', dbIds);
    //}, 3000);
}

// *******************************************
// My Color Extension
// *******************************************

function MyColorExtension(viewer, options) {
    Autodesk.Viewing.Extension.call(this, viewer, options);
}

MyColorExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
MyColorExtension.prototype.constructor = MyColorExtension;

MyColorExtension.prototype.load = function () {

    if (this.viewer.toolbar) {
        // Toolbar is already available, create the UI
        this.createUI();
    } else {
        // Toolbar hasn't been created yet, wait until we get notification of its creation
        this.onToolbarCreatedBinded = this.onToolbarCreated.bind(this);
        this.viewer.addEventListener(av.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
    }

    return true;
};

MyColorExtension.prototype.onToolbarCreated = function () {
    this.viewer.removeEventListener(av.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
    this.onToolbarCreatedBinded = null;
    this.createUI();
};

MyColorExtension.prototype.createUI = function () {
    // alert('TODO: Create Toolbar!');

    var viewer = this.viewer;

    // Button 1
    var button1 = new Autodesk.Viewing.UI.Button('red-bunny');

    button1.onClick = function (e) {
        var red = new THREE.Vector4(1, 0, 0, 0.5);

        //dbIds.forEach(dbId => {
        //    viewer.setThemingColor(dbId, red);
        //});
        color = red;
        if (color) {
           
            viewer.setThemingColor(dbId, color);
        }
    };
    button1.addClass('red-bunny');
    button1.setToolTip('Red Bunny');

    // Button 2
    var button2 = new Autodesk.Viewing.UI.Button('green-bunny');

    button2.onClick = function (e) {
        var green = new THREE.Vector4(0, 0.5, 0, 0.5);
        //dbIds.forEach(dbId => {
        //    viewer.setThemingColor(dbId, green);
        //});
        color = green;
        if (color) {
            viewer.setThemingColor(dbId, color);
        }
    };
    button2.addClass('green-bunny');
    button2.setToolTip('Green Bunny');

    // Button 3
    var button3 = new Autodesk.Viewing.UI.Button('blue-bunny');
    button3.onClick = function (e) {
        var blue = new THREE.Vector4(0, 0, 0.5, 0.5);
        //viewer.setThemingColor(3, blue);
        //dbIds.forEach(dbId => {
        //    viewer.setThemingColor(dbId, blue);
        //});
        color = blue;
        if (color) {
            viewer.setThemingColor(dbId, color);
        }
    };
    button3.addClass('blue-bunny');
    button3.setToolTip('Blue Bunny');

    // SubToolbar
    this.subToolbar = new Autodesk.Viewing.UI.ControlGroup('my-custom-view-toolbar');
    this.subToolbar.addControl(button1);
    this.subToolbar.addControl(button2);
    this.subToolbar.addControl(button3);

    viewer.toolbar.addControl(this.subToolbar);
};

MyColorExtension.prototype.unload = function () {
    this.viewer.toolbar.removeControl(this.subToolbar);
    return true;
};


Autodesk.Viewing.theExtensionManager.registerExtension('MyColorExtension', MyColorExtension);
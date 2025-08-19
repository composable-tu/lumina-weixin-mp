// custom-tab-bar/index.ts

Page({
    data: {
        value: 'task', list: [{value: 'task', label: '日程', icon: 'task-double'}, {
            value: 'approval', label: '审批', icon: 'assignment-checked'
        }, {value: 'user', label: '我', icon: 'user'}],
    }, onChange(e: any) {
        switch (e.detail.value) {
            case "task":
                wx.switchTab({
                    url: '/pages/index/index'
                });
                break;
            case "approval":
                wx.switchTab({
                    url: '/pages/approval/approval'
                });
                break;
            case 'user':
                wx.switchTab({
                    url: '/pages/user/user'
                });
                break;
        }
    },

    /**
     * **重要**
     *
     * 由于微信小程序的页面或组件构建器中的 `onLoad()` 等生命周期方法在 custom tab 不生效，
     * 所以需要在涉及 custom tab 的页面或组件的 `onLoad()` 方法中手动调用 `init()` 方法。如：
     *
     * ```JavaScript
     * onLoad() {
     *     this.getTabBar().init();
     * },
     * ```
     */
    init() {
        const currentPage = getCurrentPages().pop();
        if (currentPage) {
            const route = currentPage.route;
            let defaultTab = 'task';

            if (route.includes('approval')) defaultTab = 'approval'; else if (route.includes('more')) defaultTab = 'more'; else if (route.includes('user')) defaultTab = 'user';

            this.setData({value: defaultTab});
        }
    }
});

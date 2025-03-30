// 数据初始化
let sites = JSON.parse(localStorage.getItem('sites')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || ['常用', '工作', '学习', '娱乐'];
let currentCategory = 'all';
let currentTheme = localStorage.getItem('theme') || 'light';
let currentEngine = localStorage.getItem('searchEngine') || 'baidu';

// DOM元素
const themeToggle = document.getElementById('themeToggle');
const categoryList = document.querySelector('.category-list');
const sitesContainer = document.querySelector('.sites-container');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const addSiteBtn = document.getElementById('addSiteBtn');
const addSiteForm = document.querySelector('.add-site-form');
const engineOptions = document.querySelectorAll('.engine-option');
const addCategoryBtn = document.querySelector('.add-category');
let sidebarVisible = true; // 侧边栏默认可见

// 初始化函数
function init() {
    // 设置初始主题
    document.body.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
    
    // 设置初始搜索引擎
    setActiveSearchEngine(currentEngine);
    
    // 渲染分类和网站
    renderCategories();
    renderSites();
    
    // 初始隐藏添加网站表单
    addSiteForm.style.display = 'none';
    
    // 添加事件监听器
    setupEventListeners();
    
    // 添加移动端菜单按钮
    addMobileMenuToggle();
}

// 设置事件监听器
function setupEventListeners() {
    // 主题切换
    themeToggle.addEventListener('click', toggleTheme);
    
    // 本地搜索功能
    searchInput.addEventListener('input', handleSearch);
    
    // 搜索引擎搜索功能
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // 添加网站按钮
    addSiteBtn.addEventListener('click', toggleAddSiteForm);
    
    // 搜索引擎切换
    engineOptions.forEach(option => {
        option.addEventListener('click', () => {
            switchSearchEngine(option.dataset.engine);
        });
    });
    
    // 添加分类按钮
    addCategoryBtn.addEventListener('click', addNewCategory);
    
    // 监听窗口大小变化，调整侧边栏状态
    window.addEventListener('resize', handleResize);
}

// 主题切换功能
function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
}

// 更新主题图标
function updateThemeIcon() {
    const icon = themeToggle.querySelector('i');
    if (currentTheme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// 渲染分类
function renderCategories() {
    // 清空现有分类列表
    categoryList.innerHTML = '';
    
    // 添加"全部"分类
    const allCategory = document.createElement('div');
    allCategory.className = 'category-item' + (currentCategory === 'all' ? ' active' : '');
    allCategory.textContent = '全部';
    allCategory.addEventListener('click', () => filterByCategory('all'));
    categoryList.appendChild(allCategory);
    
    // 添加用户自定义分类
    categories.forEach(category => {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item' + (currentCategory === category ? ' active' : '');
        categoryItem.textContent = category;
        
        // 添加点击事件
        categoryItem.addEventListener('click', () => filterByCategory(category));
        
        // 添加右键菜单（编辑/删除分类）
        categoryItem.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showCategoryContextMenu(category, e.clientX, e.clientY);
        });
        
        categoryList.appendChild(categoryItem);
    });
    
    // 更新添加网站表单中的分类选择器
    updateCategorySelect();
}

// 更新分类选择器
function updateCategorySelect() {
    const categorySelect = document.getElementById('siteCategory');
    categorySelect.innerHTML = '';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// 显示分类上下文菜单
function showCategoryContextMenu(category, x, y) {
    // 移除现有菜单
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    // 创建新菜单
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.position = 'fixed';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.backgroundColor = 'var(--card-bg)';
    menu.style.boxShadow = 'var(--shadow)';
    menu.style.borderRadius = '5px';
    menu.style.padding = '5px 0';
    menu.style.zIndex = '1000';
    
    // 编辑选项
    const editItem = document.createElement('div');
    editItem.textContent = '编辑分类';
    editItem.style.padding = '8px 15px';
    editItem.style.cursor = 'pointer';
    editItem.addEventListener('mouseover', () => {
        editItem.style.backgroundColor = 'var(--secondary-color)';
    });
    editItem.addEventListener('mouseout', () => {
        editItem.style.backgroundColor = 'transparent';
    });
    editItem.addEventListener('click', () => {
        editCategory(category);
        menu.remove();
    });
    
    // 删除选项
    const deleteItem = document.createElement('div');
    deleteItem.textContent = '删除分类';
    deleteItem.style.padding = '8px 15px';
    deleteItem.style.cursor = 'pointer';
    deleteItem.style.color = '#f44336';
    deleteItem.addEventListener('mouseover', () => {
        deleteItem.style.backgroundColor = 'var(--secondary-color)';
    });
    deleteItem.addEventListener('mouseout', () => {
        deleteItem.style.backgroundColor = 'transparent';
    });
    deleteItem.addEventListener('click', () => {
        deleteCategory(category);
        menu.remove();
    });
    
    menu.appendChild(editItem);
    menu.appendChild(deleteItem);
    document.body.appendChild(menu);
    
    // 点击其他地方关闭菜单
    document.addEventListener('click', () => {
        menu.remove();
    }, { once: true });
}

// 编辑分类
function editCategory(category) {
    const newName = prompt('请输入新的分类名称:', category);
    if (newName && newName !== category) {
        // 更新分类名称
        const index = categories.indexOf(category);
        categories[index] = newName;
        
        // 更新使用该分类的网站
        sites.forEach(site => {
            if (site.category === category) {
                site.category = newName;
            }
        });
        
        // 保存并重新渲染
        saveData();
        renderCategories();
        renderSites();
    }
}

// 删除分类
function deleteCategory(category) {
    if (confirm(`确定要删除分类 "${category}" 吗？`)) {
        // 从分类列表中移除
        const index = categories.indexOf(category);
        categories.splice(index, 1);
        
        // 将使用该分类的网站移到"未分类"
        sites.forEach(site => {
            if (site.category === category) {
                site.category = '未分类';
            }
        });
        
        // 如果"未分类"不存在，则添加
        if (!categories.includes('未分类')) {
            categories.push('未分类');
        }
        
        // 保存并重新渲染
        saveData();
        renderCategories();
        renderSites();
    }
}

// 添加新分类
function addNewCategory() {
    const categoryName = prompt('请输入新分类名称:');
    if (categoryName && !categories.includes(categoryName)) {
        categories.push(categoryName);
        saveData();
        renderCategories();
    } else if (categories.includes(categoryName)) {
        alert('该分类已存在!');
    }
}

// 保存网站
function saveSite() {
    const nameInput = document.getElementById('siteName');
    const urlInput = document.getElementById('siteUrl');
    const categorySelect = document.getElementById('siteCategory');
    
    const name = nameInput.value.trim();
    const url = urlInput.value.trim();
    const category = categorySelect.value;
    
    // 验证输入
    if (!name || !url) {
        alert('请填写网站名称和网址!');
        return;
    }
    
    // 验证URL格式
    if (!isValidUrl(url)) {
        alert('请输入有效的网址，例如: https://www.example.com');
        return;
    }
    
    // 创建网站对象
    const site = {
        id: Date.now(), // 使用时间戳作为唯一ID
        name,
        url: ensureHttpPrefix(url),
        category,
        timestamp: new Date().getTime()
    };
    
    // 添加到网站列表
    sites.push(site);
    saveData();
    
    // 清空表单
    nameInput.value = '';
    urlInput.value = '';
    
    // 重新渲染网站列表
    renderSites();
    
    // 隐藏添加网站表单
    addSiteForm.style.display = 'none';
}

// 确保URL有http前缀
function ensureHttpPrefix(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return 'https://' + url;
    }
    return url;
}

// 验证URL格式
function isValidUrl(url) {
    // 简单验证
    if (!url.includes('.')) return false;
    
    // 添加http前缀再验证
    const testUrl = ensureHttpPrefix(url);
    try {
        new URL(testUrl);
        return true;
    } catch (e) {
        return false;
    }
}

// 渲染网站列表
function renderSites(filteredSites = null) {
    // 清空容器
    sitesContainer.innerHTML = '';
    
    // 确定要显示的网站列表
    let sitesToShow = filteredSites || sites;
    
    // 如果当前有选中的分类，进行过滤
    if (!filteredSites && currentCategory !== 'all') {
        sitesToShow = sites.filter(site => site.category === currentCategory);
    }
    
    // 如果没有网站，显示提示信息
    if (sitesToShow.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = '没有找到网站，请添加新网站或更改筛选条件。';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.padding = '30px';
        emptyMessage.style.color = 'var(--text-color)';
        emptyMessage.style.opacity = '0.7';
        sitesContainer.appendChild(emptyMessage);
        return;
    }
    
    // 渲染每个网站卡片
    sitesToShow.forEach(site => {
        const card = document.createElement('a');
        card.className = 'site-card';
        card.href = site.url;
        card.target = '_blank';
        card.innerHTML = `
            <h3>${site.name}</h3>
            <p>${site.url}</p>
            <span class="category-tag">${site.category}</span>
        `;
        
        // 添加右键菜单（编辑/删除网站）
        card.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showSiteContextMenu(site, e.clientX, e.clientY);
        });
        
        sitesContainer.appendChild(card);
    });
}

// 显示网站上下文菜单
function showSiteContextMenu(site, x, y) {
    // 移除现有菜单
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    // 创建新菜单
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.position = 'fixed';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.backgroundColor = 'var(--card-bg)';
    menu.style.boxShadow = 'var(--shadow)';
    menu.style.borderRadius = '5px';
    menu.style.padding = '5px 0';
    menu.style.zIndex = '1000';
    
    // 编辑选项
    const editItem = document.createElement('div');
    editItem.textContent = '编辑网站';
    editItem.style.padding = '8px 15px';
    editItem.style.cursor = 'pointer';
    editItem.addEventListener('mouseover', () => {
        editItem.style.backgroundColor = 'var(--secondary-color)';
    });
    editItem.addEventListener('mouseout', () => {
        editItem.style.backgroundColor = 'transparent';
    });
    editItem.addEventListener('click', () => {
        editSite(site);
        menu.remove();
    });
    
    // 删除选项
    const deleteItem = document.createElement('div');
    deleteItem.textContent = '删除网站';
    deleteItem.style.padding = '8px 15px';
    deleteItem.style.cursor = 'pointer';
    deleteItem.style.color = '#f44336';
    deleteItem.addEventListener('mouseover', () => {
        deleteItem.style.backgroundColor = 'var(--secondary-color)';
    });
    deleteItem.addEventListener('mouseout', () => {
        deleteItem.style.backgroundColor = 'transparent';
    });
    deleteItem.addEventListener('click', () => {
        deleteSite(site);
        menu.remove();
    });
    
    menu.appendChild(editItem);
    menu.appendChild(deleteItem);
    document.body.appendChild(menu);
    
    // 点击其他地方关闭菜单
    document.addEventListener('click', () => {
        menu.remove();
    }, { once: true });
}

// 编辑网站
function editSite(site) {
    const newName = prompt('网站名称:', site.name);
    if (!newName) return;
    
    const newUrl = prompt('网站地址:', site.url);
    if (!newUrl || !isValidUrl(newUrl)) {
        alert('请输入有效的网址!');
        return;
    }
    
    // 创建分类选择器
    const categorySelect = document.createElement('select');
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        if (category === site.category) {
            option.selected = true;
        }
        categorySelect.appendChild(option);
    });
    
    // 将选择器添加到临时容器
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(document.createTextNode('选择分类: '));
    tempDiv.appendChild(categorySelect);
    
    // 显示分类选择对话框
    const categoryDialog = document.createElement('div');
    categoryDialog.style.position = 'fixed';
    categoryDialog.style.top = '50%';
    categoryDialog.style.left = '50%';
    categoryDialog.style.transform = 'translate(-50%, -50%)';
    categoryDialog.style.backgroundColor = 'var(--card-bg)';
    categoryDialog.style.padding = '20px';
    categoryDialog.style.borderRadius = '8px';
    categoryDialog.style.boxShadow = 'var(--shadow)';
    categoryDialog.style.zIndex = '1001';
    
    categoryDialog.appendChild(tempDiv);
    
    // 添加确认按钮
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = '确认';
    confirmBtn.style.marginTop = '15px';
    confirmBtn.style.padding = '5px 15px';
    confirmBtn.style.backgroundColor = 'var(--primary-color)';
    confirmBtn.style.color = 'white';
    confirmBtn.style.border = 'none';
    confirmBtn.style.borderRadius = '4px';
    confirmBtn.style.cursor = 'pointer';
    
    confirmBtn.addEventListener('click', () => {
        // 更新网站信息
        site.name = newName;
        site.url = ensureHttpPrefix(newUrl);
        site.category = categorySelect.value;
        
        // 保存并重新渲染
        saveData();
        renderSites();
        
        // 关闭对话框
        categoryDialog.remove();
        document.body.style.overflow = 'auto';
    });
    
    categoryDialog.appendChild(confirmBtn);
    
    // 添加到页面
    document.body.appendChild(categoryDialog);
    document.body.style.overflow = 'hidden';
    
    // 点击外部关闭对话框
    document.addEventListener('click', (e) => {
        if (!categoryDialog.contains(e.target) && e.target !== categoryDialog) {
            categoryDialog.remove();
            document.body.style.overflow = 'auto';
        }
    });
}

// 删除网站
function deleteSite(site) {
    if (confirm(`确定要删除网站 "${site.name}" 吗？`)) {
        const index = sites.findIndex(s => s.id === site.id);
        if (index !== -1) {
            sites.splice(index, 1);
            saveData();
            renderSites();
        }
    }
}

// 按分类过滤网站
function filterByCategory(category) {
    currentCategory = category;
    
    // 更新分类项的活动状态
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
        if ((category === 'all' && item.textContent === '全部') || 
            (item.textContent === category)) {
            item.classList.add('active');
        }
    });
    
    // 重新渲染网站列表
    renderSites();
    
    // 隐藏添加网站表单
    addSiteForm.style.display = 'none';
}

// 搜索功能
function handleSearch(e) {
    const keyword = e.target.value.toLowerCase();
    if (!keyword) {
        renderSites();
        return;
    }
    
    // 按关键词过滤
    const filtered = sites.filter(site => 
        site.name.toLowerCase().includes(keyword) || 
        site.url.toLowerCase().includes(keyword)
    );
    
    renderSites(filtered);
}

// 保存数据到localStorage
function saveData() {
    localStorage.setItem('sites', JSON.stringify(sites));
    localStorage.setItem('categories', JSON.stringify(categories));
}

// 添加移动端菜单按钮
function addMobileMenuToggle() {
    const header = document.querySelector('header');
    const menuToggle = document.createElement('button');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    header.insertBefore(menuToggle, header.firstChild);
    
    menuToggle.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('active');
    });
    
    // 添加侧边栏开关按钮（放在侧边栏旁边）
    const sidebarToggle = document.createElement('button');
    sidebarToggle.className = 'sidebar-toggle';
    sidebarToggle.title = '切换侧边栏';
    document.body.appendChild(sidebarToggle);
    
    sidebarToggle.addEventListener('click', toggleSidebar);
}

// 切换搜索引擎
function switchSearchEngine(engine) {
    currentEngine = engine;
    localStorage.setItem('searchEngine', engine);
    setActiveSearchEngine(engine);
}

// 设置当前活动的搜索引擎
function setActiveSearchEngine(engine) {
    engineOptions.forEach(option => {
        if (option.dataset.engine === engine) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    // 更新搜索框占位符
    switch(engine) {
        case 'baidu':
            searchInput.placeholder = '百度搜索...';
            break;
        case 'google':
            searchInput.placeholder = 'Google搜索...';
            break;
        case 'bing':
            searchInput.placeholder = 'Bing搜索...';
            break;
        default:
            searchInput.placeholder = '搜索...';
    }
}

// 执行搜索
function performSearch() {
    const keyword = searchInput.value.trim();
    if (!keyword) return;
    
    let searchUrl;
    switch(currentEngine) {
        case 'baidu':
            searchUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(keyword)}`;
            break;
        case 'google':
            searchUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}`;
            break;
        case 'bing':
            searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(keyword)}`;
            break;
        default:
            searchUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(keyword)}`;
    }
    
    window.open(searchUrl, '_blank');
}

// 切换添加网站表单的显示/隐藏
function toggleAddSiteForm() {
    if (addSiteForm.style.display === 'none') {
        addSiteForm.style.display = 'block';
        // 滚动到表单位置
        addSiteForm.scrollIntoView({ behavior: 'smooth' });
    } else {
        addSiteForm.style.display = 'none';
    }
}

// 切换侧边栏显示/隐藏
function toggleSidebar() {
    sidebarVisible = !sidebarVisible;
    const sidebar = document.querySelector('.sidebar');
    const main = document.querySelector('main');
    
    if (sidebarVisible) {
        sidebar.style.transform = 'translateX(0)';
        main.style.marginLeft = '250px';
    } else {
        sidebar.style.transform = 'translateX(-100%)';
        main.style.marginLeft = '0';
    }
    
    // 按钮样式会通过CSS自动更新
}

// 处理窗口大小变化
function handleResize() {
    // 在移动设备上，默认隐藏侧边栏
    if (window.innerWidth <= 768 && sidebarVisible) {
        toggleSidebar();
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', init);
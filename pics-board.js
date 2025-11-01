document.addEventListener('DOMContentLoaded', () => {
    const designsGrid = document.getElementById('designs-grid');
    const mainCountSpan = document.getElementById('main-count');
    const fullCountSpan = document.getElementById('full-count');
    const versionsSection = document.getElementById('versions-section');
    const selectedDesign = document.getElementById('selected-design');
    const versionsGrid = document.getElementById('versions-grid');
    const backToGridBtn = document.getElementById('back-to-grid');

    let mainCount = 0;
    let fullCount = 0;
    let versionCounts = new Array(61).fill(0); // indices 1 to 60
    let pending = 0;
    const totalChecks = 60 + (60 * 10); // 60 mains + 600 versions
    const versions = 'abcdefghij';

    function updateHeader() {
        mainCountSpan.textContent = mainCount;
        fullCountSpan.textContent = fullCount;
    }

    function updateVersionCounts() {
        for (let i = 1; i <= 60; i++) {
            const container = designsGrid.children[i - 1];
            const p = container.querySelector('p');
            if (p) {
                p.textContent = `عدد الاصدارات الجاهزة: ${versionCounts[i]}`;
            }
        }
    }

    function checkImage(src, onSuccess = () => {}, onFail = () => {}) {
        pending++;
        const img = new Image();
        img.src = src;
        img.onload = () => {
            onSuccess();
            pending--;
            checkAllDone();
        };
        img.onerror = () => {
            onFail();
            pending--;
            checkAllDone();
        };
    }

    function checkAllDone() {
        if (pending === totalChecks) return; // initial
        if (pending === 0) {
            updateHeader();
            updateVersionCounts();
        }
    }

    // Create containers first
    for (let i = 1; i <= 60; i++) {
        const container = document.createElement('div');
        container.classList.add('design-container');
        container.onclick = () => showVersions(i);

        const left = document.createElement('div');
        left.classList.add('design-left');
        const img = document.createElement('img');
        img.src = `ready/${i}.jpg`;
        img.alt = `تصميم ${i}`;
        img.onerror = () => {
            left.innerHTML = '<div class="placeholder">لم يتم الانتهاء من التصميم بعد</div>';
        };
        left.appendChild(img);

        const right = document.createElement('div');
        right.classList.add('design-right');
        const h3 = document.createElement('h3');
        h3.textContent = `تصميم ${i}`;
        const p = document.createElement('p');
        p.textContent = `عدد الاصدارات الجاهزة: 0`; // will update later
        right.appendChild(h3);
        right.appendChild(p);

        container.appendChild(right);
        container.appendChild(left);

        designsGrid.appendChild(container);

        // Now check main
        checkImage(`ready/${i}.jpg`, () => { mainCount++; });

        // Check versions
        let localCount = 0;
        for (let v of versions) {
            checkImage(`ready/${i}${v}.jpg`, () => { 
                versionCounts[i]++;
                if (versionCounts[i] === 10) fullCount++;
            });
        }
    }

    // Since pending starts at 0, and checks add to pending, checkAllDone will be called on each

    function showVersions(id) {
        selectedDesign.textContent = id;
        versionsGrid.innerHTML = '';
        for (let v of versions) {
            const item = document.createElement('div');
            item.classList.add('version-item');
            const img = document.createElement('img');
            img.src = `ready/${id}${v}.jpg`;
            img.alt = `اصدار ${v}`;
            img.onerror = () => {
                item.innerHTML = '<div class="placeholder">غير جاهز</div>';
            };
            item.appendChild(img);
            versionsGrid.appendChild(item);
        }
        versionsSection.style.display = 'block';
        versionsSection.scrollIntoView({ behavior: 'smooth' });
    }

    backToGridBtn.onclick = () => {
        versionsSection.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Initial pending is 0, after loops pending will be totalChecks, but onload/error decrease
});
// script.js
document.addEventListener('DOMContentLoaded', () => {
    const artworkImage = document.getElementById('artwork-image');
    const artworkDetailNumber = document.getElementById('artwork-detail-number');
    const artworkDetailTitle = document.getElementById('artwork-detail-title');
    const artworkDetailArtist = document.getElementById('artwork-detail-artist');
    const artworkDetailInfo = document.getElementById('artwork-detail-info');
    const artworkDetailDescription = document.getElementById('artwork-detail-description');
    const paginationContainer = document.getElementById('pagination-container');
    const artistNameLink = document.getElementById('artist-name-link');
    const websiteLink = document.getElementById('website-link');
    const enlargeButton = document.getElementById('enlarge-button');
    const enlargeModal = document.getElementById('enlarge-modal');
    const enlargedImage = document.getElementById('enlarged-image');
    const closeModalButton = document.querySelector('.close-button');
    const imageLoadError = document.getElementById('image-load-error');

    const prevArtworkButton = document.getElementById('prev-artwork-button');
    const nextArtworkButton = document.getElementById('next-artwork-button');

    const scrollableContainer = document.querySelector('.gallery-main-container');
    const modalContent = document.querySelector('.modal-content');

    let artworks = [];
    let currentArtworkId = 1;

    function renderArtwork(artwork) {
        if (!artwork) {
            console.error('렌더링할 작품 데이터가 정의되지 않았습니다.');
            artworkImage.src = '';
            artworkImage.alt = '작품 로드 실패';
            artworkImage.style.display = 'none';
            imageLoadError.style.display = 'block';
            artworkDetailNumber.textContent = '';
            artworkDetailTitle.textContent = '작품 정보를 불러올 수 없습니다.';
            artworkDetailArtist.textContent = '';
            artworkDetailInfo.textContent = '';
            artworkDetailDescription.textContent = '데이터 로딩 중 오류가 발생했거나 작품을 찾을 수 없습니다.';
            enlargeButton.style.display = 'none';
            return;
        }

        artworkImage.style.display = 'block';
        imageLoadError.style.display = 'none';

        const artworkDisplay = document.querySelector('.artwork-display');
        artworkDisplay.style.opacity = 0;

        setTimeout(() => {
            artworkImage.src = artwork.thumbnail;
            artworkImage.alt = artwork.title;
            artworkDetailNumber.textContent = `${artwork.id}.`;
            artworkDetailTitle.textContent = `${artwork.artist}, ‹${artwork.title}›(${artwork.year})`;
            artworkDetailArtist.textContent = `${artwork.material}, ${artwork.size}`;
            artworkDetailInfo.textContent = '';
            artworkDetailDescription.textContent = artwork.description;
            enlargeButton.style.display = 'block';

            artworkDisplay.style.opacity = 1;
        }, 100);
    }

    artworkImage.onerror = () => {
        console.error(`이미지 로드 실패: ${artworkImage.src}`);
        artworkImage.style.display = 'none';
        imageLoadError.style.display = 'block';
        imageLoadError.textContent = `이미지 로드 실패: ${artworkImage.src.split('/').pop()} 파일을 확인해주세요.`;
    };

    artworkImage.onload = () => {
        artworkImage.style.display = 'block';
        imageLoadError.style.display = 'none';
    };

    function renderPagination() {
        // 쪽번호만 제거
        paginationContainer.innerHTML = '';

        artworks.forEach(artwork => {
            const pageNumberDiv = document.createElement('div');
            pageNumberDiv.classList.add('page-number');
            pageNumberDiv.textContent = artwork.id;
            pageNumberDiv.setAttribute('role', 'button');
            pageNumberDiv.setAttribute('tabindex', '0');
            pageNumberDiv.setAttribute('aria-label', `${artwork.id}번 작품`);

            if (artwork.id === currentArtworkId) {
                pageNumberDiv.classList.add('active');
            }

            pageNumberDiv.addEventListener('click', () => {
                navigateToArtwork(artwork.id);
            });

            pageNumberDiv.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    navigateToArtwork(artwork.id);
                }
            });

            paginationContainer.appendChild(pageNumberDiv);
        });

        // 이전/다음 버튼 활성화/비활성화 상태 및 가시성 업데이트
        updateNavigationButtons();

        // 현재 활성화된 쪽번호가 중앙에 오도록 스크롤
        const activePageNumber = paginationContainer.querySelector('.page-number.active');
        if (activePageNumber) {
            const containerWidth = paginationContainer.clientWidth;
            // 스크롤될 위치: 활성 요소의 왼쪽 끝 - (컨테이너 너비 / 2) + (활성 요소 너비 / 2)
            const scrollLeft = activePageNumber.offsetLeft - (containerWidth / 2) + (activePageNumber.clientWidth / 2);

            paginationContainer.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });
        }
    }

    function updateNavigationButtons() {
        if (currentArtworkId === 1) {
            prevArtworkButton.disabled = true;
            // prevArtworkButton.style.opacity = 0; // 필요시 완전 숨김
        } else {
            prevArtworkButton.disabled = false;
            // prevArtworkButton.style.opacity = 1;
        }

        if (currentArtworkId === artworks.length) {
            nextArtworkButton.disabled = true;
            // nextArtworkButton.style.opacity = 0; // 필요시 완전 숨김
        } else {
            nextArtworkButton.disabled = false;
            // nextArtworkButton.style.opacity = 1;
        }
    }

    function navigateToArtwork(id) {
        // 작품 ID 유효성 검사 추가 (첫 작품 < id < 마지막 작품)
        if (id < 1 || id > artworks.length) {
            console.warn(`유효하지 않은 작품 ID: ${id}`);
            return;
        }

        currentArtworkId = id;
        const artwork = artworks.find(a => a.id === id);
        if (artwork) {
            renderArtwork(artwork);
            renderPagination(); // 페이지네이션 갱신 (버튼 상태 포함)
            const newPath = `/artwork/${id}`;
            const hashUrl = `#${newPath}`;

            if (window.location.hash !== hashUrl) {
                history.replaceState({ page: id }, '', hashUrl);
            }
            if (scrollableContainer) {
                scrollableContainer.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else {
            console.error(`데이터에서 ID ${id}의 작품을 찾을 수 없습니다.`);
            renderArtwork(null);
            history.replaceState({ page: id }, '', `#/artwork/not-found`);
        }
    }

    fetch('data/artworks.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP 오류! 상태: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            artworks = data;
            const hashSegments = window.location.hash.split('/');
            const lastHashSegment = hashSegments[hashSegments.length - 1];

            let initialId = 1;

            if (hashSegments.includes('artwork') && !isNaN(parseInt(lastHashSegment))) {
                const parsedId = parseInt(lastHashSegment);
                if (parsedId >= 1 && parsedId <= artworks.length) {
                    initialId = parsedId;
                }
            }
            currentArtworkId = initialId;

            navigateToArtwork(currentArtworkId);

            window.addEventListener('popstate', (event) => {
                const popStateHashSegments = window.location.hash.split('/');
                const popStateLastSegment = popStateHashSegments[popStateHashSegments.length - 1];
                let popStateId = 1;

                if (popStateHashSegments.includes('artwork') && !isNaN(parseInt(popStateLastSegment))) {
                    const parsedId = parseInt(popStateLastSegment);
                    if (parsedId >= 1 && parsedId <= artworks.length) {
                        popStateId = parsedId;
                    }
                }
                // popstate 이벤트는 navigateToArtwork를 바로 호출하지 않고,
                // currentArtworkId만 변경한 후 renderArtwork와 renderPagination을 다시 호출하는 것이 일반적입니다.
                // 그러나 navigateToArtwork가 이미 이 로직을 포함하므로 직접 호출해도 무방합니다.
                navigateToArtwork(popStateId);
            });
        })
        .catch(error => {
            console.error('artworks.json에서 작품 데이터를 로드하는 중 오류 발생:', error);
            artworkDetailTitle.textContent = "전시관 데이터를 불러오는 데 실패했습니다.";
            artworkDetailDescription.textContent = "네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요. (오류: " + error.message + ")";
            artworkImage.style.display = 'none';
            enlargeButton.style.display = 'none';
            paginationContainer.style.display = 'none';
            prevArtworkButton.style.display = 'none'; // 버튼 숨김
            nextArtworkButton.style.display = 'none'; // 버튼 숨김
            imageLoadError.style.display = 'block';
            imageLoadError.textContent = "데이터 로딩 오류: " + error.message;
        });

    prevArtworkButton.addEventListener('click', () => {
        navigateToArtwork(currentArtworkId - 1);
    });

    nextArtworkButton.addEventListener('click', () => {
        navigateToArtwork(currentArtworkId + 1);
    });

    artistNameLink.addEventListener('click', (event) => {
        event.preventDefault();
        navigateToArtwork(1);
    });

    artistNameLink.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            navigateToArtwork(1);
        }
    });

    websiteLink.addEventListener('click', () => {});

    enlargeButton.addEventListener('click', () => {
        const currentArtwork = artworks.find(a => a.id === currentArtworkId);
        if (currentArtwork && currentArtwork.full) {
            enlargedImage.src = currentArtwork.full;
            enlargedImage.alt = `${currentArtwork.title} (확대 이미지)`;
            enlargeModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            resetZoomPan();
        } else {
            console.warn("Full-size image not available for this artwork or data not loaded.");
            alert("확대 이미지를 불러올 수 없습니다.");
        }
    });

    closeModalButton.addEventListener('click', () => {
        enlargeModal.style.display = 'none';
        document.body.style.overflow = '';
        resetZoomPan();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && enlargeModal.style.display === 'flex') {
            enlargeModal.style.display = 'none';
            document.body.style.overflow = '';
            resetZoomPan();
        }
    });

    enlargeModal.addEventListener('click', (event) => {
        if (event.target === enlargeModal) {
            enlargeModal.style.display = 'none';
            document.body.style.overflow = '';
            resetZoomPan();
        }
    });

    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let startX, startY;
    let zoomPointX = 0.5;
    let zoomPointY = 0.5;

    function applyTransform() {
        enlargedImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        enlargedImage.style.cursor = scale > 1 ? 'grab' : 'default';
    }

    function resetZoomPan() {
        scale = 1;
        translateX = 0;
        translateY = 0;
        applyTransform();
    }

    function limitPan() {
        const modalRect = modalContent.getBoundingClientRect();
        const imageNaturalWidth = enlargedImage.naturalWidth;
        const imageNaturalHeight = enlargedImage.naturalHeight;

        const scaledWidth = imageNaturalWidth * scale;
        const scaledHeight = imageNaturalHeight * scale;

        const currentRenderedWidth = enlargedImage.getBoundingClientRect().width;
        const currentRenderedHeight = enlargedImage.getBoundingClientRect().height;

        const modalRatio = modalRect.width / modalRect.height;
        const imageRatio = imageNaturalWidth / imageNaturalHeight;

        let actualImageDisplayWidth = currentRenderedWidth;
        let actualImageDisplayHeight = currentRenderedHeight;

        if (imageRatio > modalRatio) {
             actualImageDisplayHeight = modalRect.width / imageRatio;
             actualImageDisplayWidth = modalRect.width;
        } else {
             actualImageDisplayWidth = modalRect.height * imageRatio;
             actualImageDisplayHeight = modalRect.height;
        }

        if (currentRenderedWidth <= modalRect.width && currentRenderedHeight <= modalRect.height) {
            translateX = 0;
            translateY = 0;
            return;
        }

        const imgRenderedWidth = enlargedImage.getBoundingClientRect().width;
        const imgRenderedHeight = enlargedImage.getBoundingClientRect().height;

        const maxPanX = Math.max(0, (imgRenderedWidth * scale - modalRect.width) / 2);
        const maxPanY = Math.max(0, (imgRenderedHeight * scale - modalRect.height) / 2);

        translateX = Math.max(-maxPanX, Math.min(translateX, maxPanX));
        translateY = Math.max(-maxPanY, Math.min(translateY, maxPanY));
    }


    enlargedImage.addEventListener('wheel', (event) => {
        event.preventDefault();
        const scaleAmount = 0.1;
        const oldScale = scale;

        let newScale;
        if (event.deltaY < 0) {
            newScale = scale + scaleAmount;
        } else {
            newScale = scale - scaleAmount;
        }

        newScale = Math.max(0.5, Math.min(newScale, 5));

        if (newScale !== oldScale) {
            const rect = enlargedImage.getBoundingClientRect();

            const mouseXInModal = event.clientX - modalContent.getBoundingClientRect().left;
            const mouseYInModal = event.clientY - modalContent.getBoundingClientRect().top;

            const currentImageCenterX = (rect.left + rect.width / 2) - modalContent.getBoundingClientRect().left;
            const currentImageCenterY = (rect.top + rect.height / 2) - modalContent.getBoundingClientRect().top;

            const pointX = (mouseXInModal - currentImageCenterX) / oldScale;
            const pointY = (mouseYInModal - currentImageCenterY) / oldScale;

            translateX = mouseXInModal - (pointX * newScale + currentImageCenterX);
            translateY = mouseYInModal - (pointY * newScale + currentImageCenterY);

            const originX = (event.clientX - rect.left - translateX);
            const originY = (event.clientY - rect.top - translateY);

            const dx = (originX / oldScale) * (newScale - oldScale);
            const dy = (originY / oldScale) * (newScale - oldScale);

            translateX -= dx;
            translateY -= dy;


            scale = newScale;
            limitPan();
            applyTransform();
        }
    });

    enlargedImage.addEventListener('mousedown', (event) => {
        if (scale > 1) {
            isDragging = true;
            startX = event.clientX - translateX;
            startY = event.clientY - translateY;
            enlargedImage.style.cursor = 'grabbing';
            enlargedImage.style.transition = 'none';
        }
    });

    enlargedImage.addEventListener('mousemove', (event) => {
        if (!isDragging) return;
        event.preventDefault();
        translateX = event.clientX - startX;
        translateY = event.clientY - startY;

        limitPan();
        applyTransform();
    });

    enlargedImage.addEventListener('mouseup', () => {
        isDragging = false;
        enlargedImage.style.cursor = scale > 1 ? 'grab' : 'default';
        enlargedImage.style.transition = 'transform 0.1s ease-out';
    });

    enlargedImage.addEventListener('mouseleave', () => {
        isDragging = false;
        enlargedImage.style.cursor = scale > 1 ? 'grab' : 'default';
        enlargedImage.style.transition = 'transform 0.1s ease-out';
    });

    let touchStartX = 0, touchStartY = 0;
    let initialPinchDistance = 0;
    let initialZoomScale = 1;
    let lastTapTime = 0;
    let pinchZoomPointX = 0.5;
    let pinchZoomPointY = 0.5;

    enlargedImage.addEventListener('touchstart', (event) => {
        if (event.touches.length === 1) {
            isDragging = true;
            touchStartX = event.touches[0].clientX - translateX;
            touchStartY = event.touches[0].clientY - translateY;

            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTapTime;
            if (tapLength < 300 && tapLength > 0) {
                event.preventDefault();
                resetZoomPan();
            }
            lastTapTime = currentTime;

        } else if (event.touches.length === 2) {
            isDragging = false;
            initialPinchDistance = getPinchDistance(event.touches);
            initialZoomScale = scale;

            const rect = enlargedImage.getBoundingClientRect();
            const pinchCenterX_abs = (event.touches[0].clientX + event.touches[1].clientX) / 2;
            const pinchCenterY_abs = (event.touches[0].clientY + event.touches[1].clientY) / 2;

            const pointX_inImage = (pinchCenterX_abs - rect.left - translateX);
            const pointY_inImage = (pinchCenterY_abs - rect.top - translateY);

            pinchZoomPointX = pointX_inImage / scale; // Use current scale here
            pinchZoomPointY = pointY_inImage / scale; // Use current scale here
        }
        enlargedImage.style.transition = 'none';
    }, { passive: false });

    enlargedImage.addEventListener('touchmove', (event) => {
        event.preventDefault();

        if (isDragging && event.touches.length === 1) {
            translateX = event.touches[0].clientX - touchStartX;
            translateY = event.touches[0].clientY - touchStartY;
            limitPan();
            applyTransform();
        } else if (event.touches.length === 2 && initialPinchDistance > 0) {
            const currentPinchDistance = getPinchDistance(event.touches);
            let newScale = initialZoomScale * (currentPinchDistance / initialPinchDistance);
            newScale = Math.max(0.5, Math.min(newScale, 5));

            if (newScale !== scale) {
                const dx = (pinchZoomPointX * newScale) - (pinchZoomPointX * scale);
                const dy = (pinchZoomPointY * newScale) - (pinchZoomPointY * scale);

                translateX -= dx;
                translateY -= dy;

                scale = newScale;
                limitPan();
                applyTransform();
            }
        }
    }, { passive: false });

    enlargedImage.addEventListener('touchend', () => {
        isDragging = false;
        initialPinchDistance = 0;
        initialZoomScale = scale;
        enlargedImage.style.transition = 'transform 0.1s ease-out';
    });

    function getPinchDistance(touches) {
        return Math.hypot(
            touches[1].pageX - touches[0].pageX,
            touches[1].pageY - touches[0].pageY
        );
    }
});

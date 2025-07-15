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

    const scrollableContainer = document.querySelector('.gallery-main-container');

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
            // 작품 정보를 원하는 형식으로 조합하여 할당
            artworkDetailNumber.textContent = `${artwork.id}.`; // 번호는 그대로 둠
            artworkDetailTitle.textContent = `${artwork.artist}, ‹${artwork.title}›(${artwork.year})`; // 작가, ‹제목›(연도)
            artworkDetailArtist.textContent = `${artwork.material}, ${artwork.size}`; // 재료, 크기
            artworkDetailInfo.textContent = ''; // 이 요소는 이제 사용하지 않으므로 비움
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
    }

    function navigateToArtwork(id) {
        currentArtworkId = id;
        const artwork = artworks.find(a => a.id === id);
        if (artwork) {
            renderArtwork(artwork);
            renderPagination();
            const newUrl = `/artwork/${id}`;
            if (window.location.pathname !== newUrl) {
                history.pushState({ page: id }, '', newUrl);
            }
            if (scrollableContainer) {
                scrollableContainer.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else {
            console.error(`데이터에서 ID ${id}의 작품을 찾을 수 없습니다.`);
            renderArtwork(null);
            history.pushState({ page: id }, '', `/artwork/not-found`);
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

            const pathSegments = window.location.pathname.split('/');
            const lastSegment = pathSegments[pathSegments.length - 1];
            let initialId = 1;

            if (pathSegments.includes('artwork') && !isNaN(parseInt(lastSegment))) {
                const parsedId = parseInt(lastSegment);
                if (parsedId >= 1 && parsedId <= artworks.length) {
                    initialId = parsedId;
                }
            }
            currentArtworkId = initialId;

            navigateToArtwork(currentArtworkId);

            window.addEventListener('popstate', (event) => {
                if (event.state && event.state.page) {
                    currentArtworkId = event.state.page;
                    const artwork = artworks.find(a => a.id === currentArtworkId);
                    if (artwork) {
                        renderArtwork(artwork);
                        renderPagination();
                    } else {
                        renderArtwork(null);
                    }
                } else {
                    navigateToArtwork(1);
                }
            });
        })
        .catch(error => {
            console.error('artworks.json에서 작품 데이터를 로드하는 중 오류 발생:', error);
            artworkDetailTitle.textContent = "전시관 데이터를 불러오는 데 실패했습니다.";
            artworkDetailDescription.textContent = "네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요. (오류: " + error.message + ")";
            artworkImage.style.display = 'none';
            enlargeButton.style.display = 'none';
            paginationContainer.style.display = 'none';
            imageLoadError.style.display = 'block';
            imageLoadError.textContent = "데이터 로딩 오류: " + error.message;
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

    function applyTransform() {
        enlargedImage.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
        enlargedImage.style.cursor = scale > 1 ? 'grab' : 'default';
    }

    function resetZoomPan() {
        scale = 1;
        translateX = 0;
        translateY = 0;
        applyTransform();
    }

    enlargedImage.addEventListener('wheel', (event) => {
        event.preventDefault();
        const scaleAmount = 0.1;
        const oldScale = scale;

        if (event.deltaY < 0) {
            scale += scaleAmount;
        } else {
            scale -= scaleAmount;
        }

        scale = Math.max(0.5, Math.min(scale, 5));

        const rect = enlargedImage.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        translateX = mouseX - (mouseX - translateX) * (scale / oldScale);
        translateY = mouseY - (mouseY - translateY) * (scale / oldScale);

        applyTransform();
    });

    enlargedImage.addEventListener('mousedown', (event) => {
        if (scale > 1) {
            isDragging = true;
            startX = event.clientX - translateX;
            startY = event.clientY - translateY;
            enlargedImage.style.cursor = 'grabbing';
        }
    });

    enlargedImage.addEventListener('mousemove', (event) => {
        if (!isDragging) return;
        event.preventDefault();
        translateX = event.clientX - startX;
        translateY = event.clientY - startY;
        applyTransform();
    });

    enlargedImage.addEventListener('mouseup', () => {
        isDragging = false;
        enlargedImage.style.cursor = scale > 1 ? 'grab' : 'default';
    });

    enlargedImage.addEventListener('mouseleave', () => {
        isDragging = false;
        enlargedImage.style.cursor = scale > 1 ? 'grab' : 'default';
    });

    let touchStartX = 0, touchStartY = 0;
    let initialPinchDistance = 0;
    let initialZoomScale = 1;
    let lastTapTime = 0;

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

            const midX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
            const midY = (event.touches[0].clientY + event.touches[1].clientY) / 2;

            const rect = enlargedImage.getBoundingClientRect();
            startX = midX - translateX - rect.left;
            startY = midY - translateY - rect.top;
        }
        enlargedImage.style.transition = 'none';
    }, { passive: false });

    enlargedImage.addEventListener('touchmove', (event) => {
        event.preventDefault();

        if (isDragging && event.touches.length === 1) {
            translateX = event.touches[0].clientX - touchStartX;
            translateY = event.touches[0].clientY - touchStartY;
            applyTransform();
        } else if (event.touches.length === 2 && initialPinchDistance > 0) {
            const currentPinchDistance = getPinchDistance(event.touches);
            const zoomFactor = currentPinchDistance / initialPinchDistance;

            scale = initialZoomScale * zoomFactor;
            scale = Math.max(0.5, Math.min(scale, 5));

            const midX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
            const midY = (event.touches[0].clientY + event.touches[1].clientY) / 2;

            const rect = enlargedImage.getBoundingClientRect();
            translateX = midX - (midX - rect.left - translateX) * (scale / initialZoomScale);
            translateY = midY - (midY - rect.top - translateY) * (scale / initialZoomScale);

            applyTransform();
        }
    }, { passive: false });

    enlargedImage.addEventListener('touchend', () => {
        isDragging = false;
        initialPinchDistance = 0;
        initialZoomScale = 1;
        enlargedImage.style.transition = 'transform 0.1s ease-out';
    });

    function getPinchDistance(touches) {
        return Math.hypot(
            touches[1].pageX - touches[0].pageX,
            touches[1].pageY - touches[0].pageY
        );
    }
});
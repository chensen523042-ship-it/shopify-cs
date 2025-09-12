/**
 * Scrolling Image Reveal Section JavaScript
 * 滚动图片揭示效果组件
 */

class ScrollingImageReveal {
  constructor(sectionId) {
    this.sectionId = sectionId;
    this.root = document.getElementById(sectionId);
    if (!this.root) return;

    this.stage = this.root.querySelector('.sir-stage');
    this.cards = this.root.querySelectorAll('.sir-card');
    this.totalCards = this.cards.length;
    
    if (!this.stage || this.totalCards === 0) return;

    this.ticking = false;
    this.init();
  }

  init() {
    // 监听滚动事件
    window.addEventListener('scroll', () => this.updateCards(), { passive: true });
    window.addEventListener('resize', () => this.updateCards(), { passive: true });
    
    // 初始调用
    this.updateCards();
  }

  updateCards() {
    if (this.ticking) return;
    this.ticking = true;
    
    requestAnimationFrame(() => {
      const stageRect = this.stage.getBoundingClientRect();
      const stageHeight = stageRect.height;
      
      // 重新设计滚动进度计算：基于整个section的滚动位置
      const sectionRect = this.root.getBoundingClientRect();
      const sectionHeight = this.root.offsetHeight;
      
      // 计算基础滚动进度
      const baseProgress = (window.innerHeight - sectionRect.top) / (window.innerHeight + sectionHeight);
      
      // 调整滚动进度：让最后一张卡片完全显示后进度才到100%
      // 将进度范围压缩到 0-0.8，这样最后一张卡片(0.67-0.8)完成后，进度才到0.8
      // 然后从0.8-1.0是额外的滚动空间，确保最后一张卡片完全显示
      // 允许进度超过1.0，让最后一张卡片也能移动
      const scrollProgress = Math.max(0, baseProgress * 1.25);
      
      // 调试信息（可以在控制台查看）
      console.log('Scroll Progress:', scrollProgress.toFixed(3));
      
      // 找到当前最活跃的卡片（透明度最高的）
      let activeCardIndex = 0;
      let maxOpacity = 0;
      
      this.cards.forEach((card, index) => {
        const cardIndex = parseInt(card.dataset.cardIndex) || index;
        
        // 简化设计：每张卡片占据相等的滚动范围，无重叠
        const cardRange = 1 / this.totalCards;
        const cardStart = cardIndex * cardRange;
        const cardEnd = (cardIndex + 1) * cardRange;
        
        // 计算当前卡片的进度
        let cardProgress = 0;
        if (scrollProgress >= cardStart && scrollProgress <= cardEnd) {
          cardProgress = (scrollProgress - cardStart) / cardRange;
        } else if (scrollProgress > cardEnd) {
          cardProgress = 1;
        }
        
        // 特殊处理最后一张卡片：让它有更多时间保持完全显示状态
        if (cardIndex === this.totalCards - 1 && scrollProgress > cardEnd) {
          // 最后一张卡片完成后，保持完全显示状态
          cardProgress = 1;
        }
        
        // 计算下一张卡片的进度，用于控制当前卡片的淡出
        let nextCardProgress = 0;
        if (cardIndex < this.totalCards - 1) {
          const nextCardStart = (cardIndex + 1) * cardRange;
          const nextCardEnd = (cardIndex + 2) * cardRange;
          if (scrollProgress >= nextCardStart && scrollProgress <= nextCardEnd) {
            nextCardProgress = (scrollProgress - nextCardStart) / cardRange;
          } else if (scrollProgress > nextCardEnd) {
            nextCardProgress = 1;
          }
        }
        
        // 使用线性缓动，确保变化更明显
        const easedProgress = cardProgress;
        const nextEasedProgress = nextCardProgress;
        
        // 计算属性值
        let opacity = easedProgress;
        let scale = 0.8 + easedProgress * 0.2; // 0.8 → 1.0
        let blur = 20 - easedProgress * 20; // 20px → 0px
        
        // 计算水平偏移量
        let translateX = 0;
        
        // 当下一张卡片开始显示时，当前卡片开始移动
        if (nextEasedProgress > 0) {
          // 卡片在移动过程中继续放大
          scale = 1 + nextEasedProgress * 0.5; // 从1.0放大到1.5
          
          // 根据卡片位置计算水平偏移
          // 偶数索引（0,2,4...）向左移动，奇数索引（1,3,5...）向右移动
          // 移动到屏幕最边缘，使用视口宽度的一半加上卡片宽度的一半
          const moveDistance = window.innerWidth / 2 + 600; // 移动到屏幕边缘
          if (cardIndex % 2 === 0) {
            // 偶数索引：向左移动
            translateX = -nextEasedProgress * moveDistance;
          } else {
            // 奇数索引：向右移动
            translateX = nextEasedProgress * moveDistance;
          }
        }
        
        // 当下一张卡片显示到一定程度时，当前卡片开始模糊和淡出
        if (nextEasedProgress > 0.3) {
          // 调整淡出进度，让卡片在移动的前几帧保持清晰
          const fadeProgress = (nextEasedProgress - 0.2) / 0.8; // 0.2-1.0 映射到 0-1
          // 当前卡片逐渐变模糊并消失
          opacity = Math.max(0, 1 - fadeProgress * 1.5); // 快速淡出
          blur = Math.min(30, fadeProgress * 30); // 逐渐变模糊
        }
        
        // 特殊处理最后一张卡片：当滚动进度达到100%后也开始移动
        if (cardIndex === this.totalCards - 1 && scrollProgress >= 1.0) {
          // 计算超出100%的进度
          const extraProgress = Math.min(1, (scrollProgress - 1.0) * 2); // 0-1的额外进度
          
          // 最后一张卡片也开始淡出和移动
          opacity = Math.max(0, 1 - extraProgress * 1.5); // 快速淡出
          blur = Math.min(30, extraProgress * 30); // 逐渐变模糊
          scale = 1 + extraProgress * 0.5; // 从1.0放大到1.5
          
          // 根据最后一张卡片的位置计算移动方向
          const moveDistance = window.innerWidth / 2 + 600;
          if (cardIndex % 2 === 0) {
            // 偶数索引：向左移动
            translateX = -extraProgress * moveDistance;
          } else {
            // 奇数索引：向右移动
            translateX = extraProgress * moveDistance;
          }
        }
        
        // 应用变换
        card.style.opacity = opacity;
        card.style.transform = `translate(calc(-50% + ${translateX}px), -50%) scale(${scale})`;
        
        // 整个卡片应用模糊效果
        card.style.filter = `blur(${blur}px)`;
        
        // 但是文本区域保持清晰
        const cardCopy = card.querySelector('.sir-card__copy');
        if (cardCopy) {
          cardCopy.style.filter = 'blur(0px)'; // 文本区域不模糊
        }
        
        // 调试信息
        if (cardIndex <= 1 || cardIndex === this.totalCards - 1) {
          const extraProgress = cardIndex === this.totalCards - 1 && scrollProgress >= 1.0 ? 
            Math.min(1, (scrollProgress - 1.0) * 2) : 0;
          console.log(`Card ${cardIndex}: progress=${cardProgress.toFixed(3)}, nextProgress=${nextEasedProgress.toFixed(3)}, extraProgress=${extraProgress.toFixed(3)}, opacity=${opacity.toFixed(3)}, blur=${blur.toFixed(1)}px, translateX=${translateX.toFixed(1)}px`);
        }
        
        // 为当前活跃卡片添加类名
        if (cardProgress > 0.1 && cardProgress < 0.9) {
          card.classList.add('is-active');
        } else {
          card.classList.remove('is-active');
        }
        
        // 记录透明度最高的卡片
        if (opacity > maxOpacity) {
          maxOpacity = opacity;
          activeCardIndex = cardIndex;
        }
      });
      
      // 更新舞台背景图片或视频
      const activeCard = this.cards[activeCardIndex];
      if (activeCard) {
        const cardImage = activeCard.querySelector('.sir-card__media img');
        const cardVideo = activeCard.querySelector('.sir-card__media video');
        
        if (cardImage) {
          const imageSrc = cardImage.src;
          this.stage.style.setProperty('--bg-image', `url(${imageSrc})`);
        } else if (cardVideo) {
          // 对于视频，我们可以使用视频的第一帧作为背景
          // 或者保持背景透明，让视频本身显示
          this.stage.style.setProperty('--bg-image', 'none');
        }
      }
      
      this.ticking = false;
    });
  }
}

// 自动初始化所有滚动图片揭示组件
document.addEventListener('DOMContentLoaded', function() {
  const sections = document.querySelectorAll('[id^="sir-"]');
  sections.forEach(section => {
    new ScrollingImageReveal(section.id);
  });
});

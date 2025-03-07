// FAQ ページ用のJavaScript
document.addEventListener('DOMContentLoaded', function() {
    // FAQ項目のアコーディオン機能（オプション）
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;

            // アニメーションのために高さを切り替える
            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
                this.classList.remove('active');
            } else {
                answer.style.maxHeight = answer.scrollHeight + "px";
                this.classList.add('active');
            }
        });
    });

    // 検索機能（将来の拡張用）
    const searchInput = document.getElementById('faq-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const faqItems = document.querySelectorAll('.faq-item');

            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question').textContent.toLowerCase();
                const answer = item.querySelector('.faq-answer').textContent.toLowerCase();

                if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
});
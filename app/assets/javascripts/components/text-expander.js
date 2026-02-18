App.TextExpander = function(params) {
	this.container = params.container;
	this.maxLength = params.maxLength || 60;
	this.moreText = params.moreText || 'Show more';
	this.lessText = params.lessText || 'Show less';

	// Get original HTML, not just text, so <br> is preserved
	this.originalHtml = this.container.html().trim();
	this.originalText = this.container.text().trim(); // plain text length check

	if (this.originalText.length > this.maxLength) {
		this.truncatedText = this.originalText.substring(0, this.maxLength) + '…';
		this.isTruncated = true;
		this.render();
	}
};

App.TextExpander.prototype.render = function() {
	this.container.empty();

	this.textSpan = $('<span class="app-truncate__text"></span>').html(this.truncatedText);
	this.toggleLink = $('<a href="#" class="app-truncate__link"></a>').text(this.moreText);

	this.container.append(this.textSpan).append(' ').append(this.toggleLink);

	this.toggleLink.on('click', $.proxy(this, 'onToggleClick'));
};

App.TextExpander.prototype.onToggleClick = function(e) {
	e.preventDefault();

	if (this.isTruncated) {
		this.textSpan.html(this.originalHtml);
		this.toggleLink.text(this.lessText);
		this.isTruncated = false;
	} else {
		this.textSpan.text(this.originalText.substring(0, this.maxLength) + '…');
		this.toggleLink.text(this.moreText);
		this.isTruncated = true;
	}
};

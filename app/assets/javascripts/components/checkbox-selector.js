App.CheckboxSelector = function(options) {
  this.container = options.container;
  this.toggleButton = $('<button type="button" class="govuk-button govuk-button--secondary">Select all</button>');
  this.container[options.injectRule](this.toggleButton);
  this.toggleButton.on('click', $.proxy(this, 'onButtonClick'));
  this.container.append(this.toggle);
  this.checkboxes = options.checkboxes;
  this.checkboxes.on('click', $.proxy(this, 'onCheckboxClick'));
  this.checked = options.checked || false;
};

App.CheckboxSelector.prototype.onButtonClick = function(e) {
  if(this.checked) {
    this.uncheckAll();
    this.toggleButton.html('Select all'); 
  } else {
    this.checkAll();
    this.toggleButton.html('Deselect all');
  }
};

App.CheckboxSelector.prototype.checkAll = function() {
  this.checkboxes.each($.proxy(function(index, el) {
    el.checked = true;
  }, this));
  this.checked = true;
};

App.CheckboxSelector.prototype.uncheckAll = function() {
  this.checkboxes.each($.proxy(function(index, el) {
    el.checked = false;
  }, this));
  this.checked = false;
};

App.CheckboxSelector.prototype.onCheckboxClick = function(e) {
  if(!e.target.checked) {
    this.toggleButton[0].checked = false;
    this.checked = false;
    this.toggleButton.html('Select all');
  } else {
    if(this.checkboxes.filter(':checked').length === this.checkboxes.length) {
      this.toggleButton[0].checked = true;
      this.checked = true;
      this.toggleButton.html('Deselect all');
    }
  }
};
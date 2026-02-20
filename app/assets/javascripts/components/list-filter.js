App.ListFilter = function(params) {
  this.params = params
  this.container = $(params.container)
  this.container.addClass('app-list-filter--enhanced')
  this.checkboxes = this.container.find("input[type='checkbox']")
  this.radios = this.container.find("input[type='radio']")
  this.items = this.checkboxes.length ? this.checkboxes : this.radios
  this.itemsContainer = this.container.find('.app-list-filter__container')
  this.itemsInnerContainer = this.itemsContainer.children('.app-list-filter__container-inner')
  this.legend = this.container.find('legend')
  this.setupStatusBox()
  this.setupTextBox()
  if(this.container.find('.app-list-filter__container--max')[0]) {
    this.setupHeight()
  }
  if(this.checkboxes.length) {
    this.setupCheckboxNavigation()
  }
}

App.ListFilter.prototype.setupHeading = function() {
  this.heading = $('<p class="app-list-filter__title" aria-hidden="true">' + this.legend.text() + '</p>')
  this.container.prepend(this.heading)
}

App.ListFilter.prototype.setupTextBox = function() {
  this.itemsContainer.before(this.getTextBoxHtml())
  this.textBox = this.container.find('.app-list-filter__filter-input')
  this.textBox.on('keyup', $.proxy(this, 'onTextBoxKeyUp'))
}

App.ListFilter.prototype.getTextBoxHtml = function() {
  var id = this.container[0].id
  var html = ''
  html += '<label for="' + id + '-list-filter__filter-input" class="govuk-label govuk-visually-hidde">' + this.params.textBox.label + '</label>'
  html += '<input id="' + id + '-list-filter__filter-input" class="app-list-filter__filter-input govuk-input" type="text" aria-describedby="' + id + '-list-filter-status" aria-controls="' + id + '-items" autocomplete="off" spellcheck="false">'
  return html
}

App.ListFilter.prototype.setupStatusBox = function() {
  this.statusBox = $('<div class="govuk-visually-hidden" role="status" id="' + this.container[0].id + '-list-filter-status"></div>')
  this.updateStatusBox({
    foundCount: this.getAllVisibleItems().length,
    checkedCount: this.getAllVisibleCheckedItems().length
  })
  this.container.append(this.statusBox)
}

App.ListFilter.prototype.updateStatusBox = function(params) {
  var status = '%found% options found, %selected% selected'
  status = status.replace(/%found%/, params.foundCount)
  status = status.replace(/%selected%/, params.checkedCount)
  this.statusBox.html(status)
}

App.ListFilter.prototype.onTextBoxKeyUp = function(e) {
  var ENTER_KEY = 13
  if (e.keyCode === ENTER_KEY) {
    e.preventDefault()
  } else {
    this.filterList()
  }
}

App.ListFilter.prototype.cleanString = function(text) {
  text = text.replace(/&/g, 'and')
  text = text.replace(/[’',:–-]/g, '') // remove punctuation characters
  text = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // escape special characters
  return text.trim().replace(/\s\s+/g, ' ').toLowerCase() // replace multiple spaces with one
}

App.ListFilter.prototype.filterList= function() {
  var textValue = this.cleanString(this.textBox.val())

  var allItems = this.getAllItems()
  // hide all items
  allItems.hide()

  for(var i = 0; i < allItems.length; i++ ) {
    var labelValue = this.cleanString($(allItems[i]).find('.govuk-label').text())
    if(labelValue.search(textValue) !== -1) {
      $(allItems[i]).show()
    }
  }

  this.updateStatusBox({
    foundCount: this.getAllVisibleItems().length,
    checkedCount: this.getAllVisibleCheckedItems().length
  })
  if (this.checkboxes.length) {
    this.updateCheckboxTabIndex()
  }
}

App.ListFilter.prototype.getAllItems = function() {
  return this.itemsContainer.find('.app-list-filter__item')
}

App.ListFilter.prototype.getAllVisibleItems = function() {
  return this.getAllItems().filter(function(i, el) {
    return $(el).css('display') != 'none'
  })
}

App.ListFilter.prototype.getAllVisibleCheckedItems = function() {
  return this.getAllVisibleItems().filter(function(i, el) {
    return $(el).find("input[type='radio'], input[type='checkbox']")[0].checked
  })
}

App.ListFilter.prototype.setupCheckboxNavigation = function() {
  this.checkboxes.attr('tabindex', '-1')
  this.updateCheckboxTabIndex()
  this.itemsContainer.on('keydown', 'input[type="checkbox"]', $.proxy(this, 'onCheckboxKeyDown'))
}

App.ListFilter.prototype.onCheckboxKeyDown = function(e) {
  var UP_ARROW = 38
  var DOWN_ARROW = 40

  if (e.keyCode === DOWN_ARROW) {
    e.preventDefault()
    this.focusNextCheckbox(e.target)
  } else if (e.keyCode === UP_ARROW) {
    e.preventDefault()
    this.focusPreviousCheckbox(e.target)
  }
}

App.ListFilter.prototype.focusNextCheckbox = function(current) {
  var visibleCheckboxes = this.getVisibleCheckboxes()
  var currentIndex = visibleCheckboxes.index(current)
  var nextIndex = currentIndex + 1

  if (nextIndex < visibleCheckboxes.length) {
    $(current).attr('tabindex', '-1')
    $(visibleCheckboxes[nextIndex]).attr('tabindex', '0').focus()
  }
}

App.ListFilter.prototype.focusPreviousCheckbox = function(current) {
  var visibleCheckboxes = this.getVisibleCheckboxes()
  var currentIndex = visibleCheckboxes.index(current)
  var prevIndex = currentIndex - 1

  if (prevIndex >= 0) {
    $(current).attr('tabindex', '-1')
    $(visibleCheckboxes[prevIndex]).attr('tabindex', '0').focus()
  }
}

App.ListFilter.prototype.getVisibleCheckboxes = function() {
  return this.checkboxes.filter(function(i, el) {
    return $(el).closest('.app-list-filter__item').css('display') !== 'none'
  })
}

App.ListFilter.prototype.updateCheckboxTabIndex = function() {
  var visibleCheckboxes = this.getVisibleCheckboxes()
  visibleCheckboxes.attr('tabindex', '-1')
  visibleCheckboxes.first().attr('tabindex', '0')
}

App.ListFilter.prototype.setContainerHeight = function(height) {
  this.itemsContainer.css({
    height: height
  })
}

App.ListFilter.prototype.isItemInView = function(index, option) {
  var $item = $(option)
  var initialOptionContainerHeight = this.itemsContainer.height()
  var optionListOffsetTop = this.itemsInnerContainer.offset().top
  var distanceFromTopOfContainer = $item.offset().top - optionListOffsetTop
  return distanceFromTopOfContainer < initialOptionContainerHeight
}

App.ListFilter.prototype.getVisibleItems = function() {
  var visibleItems = this.items.filter(this.isItemInView.bind(this))
  // add an extra checkbox/radio, if the label of the first is too long it collapses onto itself
  visibleItems = visibleItems.add(this.items[visibleItems.length])
  return visibleItems
}

App.ListFilter.prototype.setupHeight = function() {
  var initialOptionContainerHeight = this.itemsContainer.height()
  var height = this.itemsInnerContainer.outerHeight(true)

  // check whether this is hidden by progressive disclosure,
  // because height calculations won't work
  if (this.itemsContainer[0].offsetParent === null) {
    initialOptionContainerHeight = 300
    height = 300
  }

  // Resize if the list is only slightly bigger than its container
  if (height < initialOptionContainerHeight + 50) {
    this.setContainerHeight(height + 1)
    return
  }

  // Resize to cut last item cleanly in half
  var lastVisibleItem = this.getVisibleItems().last()
  var position = lastVisibleItem.parent()[0].offsetTop // parent element is relative
  this.setContainerHeight(position + (lastVisibleItem.height() / 1.5))
}

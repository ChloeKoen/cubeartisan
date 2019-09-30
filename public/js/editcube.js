var canEdit = $('#edittoken').val();
var listGranularity = 50;
var listPosition = 0;
var changes = [];
var sorts = [];
var filters = [];
var show_tag_colors = $('#hideTagColors').val() !== 'true';
var urlFilterText = '';

var comparing = false;
if ($('#in_both').length) {
  comparing = true;
  var in_both = JSON.parse($('#in_both').val());
  var only_a = JSON.parse($('#only_a').val());
  var only_b = JSON.parse($('#only_b').val());
  view = 'table';
}

var cubeDict = {},
  hasCustomImages = false;
$("#customImageDisplayMenuItem").hide();
var cube = JSON.parse($('#cuberaw').val());
cube.forEach(function(card, index) {
  card.index = index;
  cubeDict[index] = card;
  if (!hasCustomImages && card.imgUrl !== undefined) {
    hasCustomImages = true;
    $("#customImageDisplayToggle").prop("checked", true);
    $("#customImageDisplayMenuItem").show();
  }
});
var cubeTagColors = JSON.parse($('#cubeTagColors').val());

$('.updateButton').click(function(e) {
  updateCubeList();
});

$('#customImageDisplayToggle').click(function(e) {
  var enabled = $(this).prop('checked'),
    display_image;
  cube.forEach(function(card, index) {
    adjustDisplayImage(card, enabled);
  });
  updateCubeList();
});

var editListeners = [];

if (canEdit) {
  $('#addInput').keyup(function(e) {
    if (e.keyCode === 13 && $('#addInput').val().length == 0) {
      e.preventDefault();
      justAdd();
    }
  });
  $('#removeInput').keyup(function(e) {
    if (e.keyCode === 13 && $('#removeInput').val().length == 0) {
      e.preventDefault();
      remove();
    }
  });
}

var tagColorsListeners = [];

function tagColorsModal() {
  let b_id = $('#cubeB_ID').val();
  let query = (b_id) ? `?b_id=${b_id}` : '';
  fetch(`/cube/api/cubetagcolors/${$('#cubeID').val()}${query}`, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json'
    },
    query: {
      b_id: $('#cubeB_ID').val(),
    },
  }).then(res => {
    res.json().then(data => {
      let html = '';
      let tag_colors = data.tag_colors;
      cubeTagColors = tag_colors;

      show_tag_colors = data.show_tag_colors;
      $('#showTagColorsCheckbox').prop("checked", show_tag_colors);

      tagColorsListeners.forEach(listener => listener());

      const tag_color_options = [
        'Red',
        'Brown',
        'Orange',
        'Yellow',
        'Green',
        'Turquoise',
        'Blue',
        'Purple',
        'Violet',
        'Pink',
      ];

      tag_colors.forEach(function(item, index) {
        let tag = item.tag;
        let color = item.color;

        html += '<div class="row tag-color-row">'

        let tag_class = ''
        if (color) {
          tag_color_options.forEach(function(opt, index) {
            if (opt.toLowerCase() === color) {
              tag_class = `tag-color tag-${opt.toLowerCase()}`;
              return false;
            }
          });
        }

        html += '<div class="col">'
        html += `<div class="tag-item ${tag_class}">${tag}</div>`
        html += '</div>'

        if (canEdit && !comparing) {
          html += '<div class="col">'
          html += '<select class="tag-color-select">'
          html += '<option value="">No Color</option>'
          tag_color_options.forEach(function(opt, index) {
            const sel = (opt.toLowerCase() === color) ? 'selected' : '';
            html += `<option value="${opt}" ${sel}>${opt}</option>`
          })
          html += '</select>'
          html += '</div>'
        }

        html += '</div>'
      });
      $('#tagsColumn').html(html);

      if (canEdit && !comparing) {
        $('#tagsColumn').sortable({
          helper: function(e, item) {
            let copy = $(item).clone();
            $(copy).addClass('tag-sort-helper');
            return copy;
          },
          forcePlaceholderSize: true,
          placeholder: 'tag-sort-placeholder',
        });
      }
      $('#tagsColumn').disableSelection();

      if (canEdit && !comparing) {
        $('.tag-color-select').change(function() {
          let $item = $(this).parent().parent().find('.tag-item');
          tag_color_options.forEach(function(opt, index) {
            $item.removeClass(`tag-color tag-${opt.toLowerCase()}`);
          });
          if ($(this).val()) {
            $item.addClass(`tag-color tag-${$(this).val().toLowerCase()}`);
          }
        });
      }

      $('#tagColorsModal').modal('show');
    });
  });
};

$('#tagColors').click(tagColorsModal);

$('#showTagColorsCheckbox').change(function(e) {
  fetch("/cube/api/saveshowtagcolors", {
    method: "POST",
    body: JSON.stringify({
      show_tag_colors: $(this).prop("checked"),
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => {
    show_tag_colors = $(this).prop("checked");
    tagColorsListeners.forEach(listener => listener());
    updateCubeList();
  });
});

$('#applyAdvancedFilterButton').click(function(e) {
  e.preventDefault();

  var str = '';

  if ($('#filterName').val().length > 0) {
    str += 'n:' + $('#filterName').val();
  }

  if ($('#filterOracle').val().length > 0) {
    var split = $('#filterOracle').val().split(' ');
    split.forEach(function(val, index) {
      str += ' o:' + val;
    });
  }

  if ($('#filterCMC').val().length > 0) {
    if ($('#filterCMCOp').val() == '!') {
      str += ' -cmc=' + $('#filterCMC').val();
    } else {
      str += ' cmc' + $('#filterCMCOp').val() + $('#filterCMC').val();
    }
  }
  if ($('#filterPower').val().length > 0) {
    if ($('#filterPowerOp').val() == '!') {
      str += ' -pow=' + $('#filterPower').val();
    } else {
      str += ' pow' + $('#filterPowerOp').val() + $('#filterPower').val();
    }
  }
  if ($('#filterToughness').val().length > 0) {
    if ($('#filterToughnessOp').val() == '!') {
      str += ' -tou=' + $('#filterToughness').val();
    } else {
      str += ' tou' + $('#filterToughnessOp').val() + $('#filterToughness').val();
    }
  }

  //Color
  var colorStr = '';
  ['W', 'U', 'B', 'R', 'G', 'C'].forEach(function(val, index) {
    if ($('#filterColor' + val).prop('checked')) {
      colorStr += val;
    }
  });
  if (colorStr.length > 0) {
    str += ' c' + $('#filterColorOp').val() + colorStr;
  }
  //Color Identity
  colorStr = '';
  ['W', 'U', 'B', 'R', 'G', 'C'].forEach(function(val, index) {
    if ($('#filterColorIdentity' + val).prop('checked')) {
      colorStr += val;
    }
  });
  if (colorStr.length > 0) {
    str += ' ci' + $('#filterColorIdentityOp').val() + colorStr;
  }
  //Mana
  if ($('#filterMana').val().length > 0) {
    str += ' m:' + $('#filterMana').val();
  }

  //Type
  if ($('#filterType').val().length > 0) {
    str += ' t:' + $('#filterType').val();
  }

  //tags
  if ($('#filterTag').val().length > 0) {
    str += ' tag:"' + $('#filterTag').val() + '"';
  }

  //price
  if ($('#filterPrice').val().length > 0) {
    str += ' p' + $('#filterPriceOp').val() + $('#filterPrice').val();
  }

  //price foil 
  if ($('#filterPriceFoil').val().length > 0) {
    str += ' pf' + $('#filterPriceFoilOp').val() + $('#filterPriceFoil').val();
  }

  //status
  if ($('#filterStatus').val().length > 0) {
    str += ' stat:"' + $('#filterStatus').val() + '"';
  }

  //loyalty

  //manacost type

  //artist

  // rarity
  if ($('#filterRarity').val().length > 0) {
    str += ' r' + $('#filterRarityOp').val() + $('#filterRarity').val();
  }

  $('#filterInput').val(str);
  $('#filterModal').modal('hide');
  updateFilters(str);
});

if (canEdit && !comparing) {
  $('#tagColorsSubmit').click(function(e) {
    let data = [];
    let tags = $('.tag-color-row .tag-item');
    let colors = $('.tag-color-row .tag-color-select');

    for (let i = 0; i < tags.length; i++) {
      let tag = $(tags[i]).html();
      let color = $(colors[i]).children('option:selected');
      color = (color.val()) ? color.val().toLowerCase() : null;
      data.push({
        tag,
        color
      });
    }

    fetch("/cube/api/savetagcolors/" + $('#cubeID').val(), {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => {
      cubeTagColors = data;
      tagColorsListeners.forEach(listener => listener());
      if (show_tag_colors) {
        updateCubeList();
      }
      $('#tagColorsModal').modal('hide');
    });
  });
}

function cardsAreEquivalent(card, details) {
  if (card.cardID != details.cardID) {
    return false;
  }
  if (card.status != details.status) {
    return false;
  }
  if (card.cmc != details.cmc) {
    return false;
  }
  if (card.type_line != details.type_line) {
    return false;
  }
  if (!arraysEqual(card.tags, details.tags)) {
    return false;
  }
  if (!arraysEqual(card.colors, details.colors)) {
    return false;
  }

  return true;
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function justAdd() {
  var val = $('#addInput').val().replace('?', '-q-');
  while (val.includes('//')) {
    val = val.replace('//', '-slash-');
  }
  if (val.length > 0) {
    fetch('/cube/api/getcard/' + val)
      .then(response => response.json())
      .then(function(json) {
        if (json.card) {
          $('#addInput').val('');
          changes.push({
            add: json.card
          })
          updateCollapse();
          $('.warnings').collapse("hide");
        } else {
          $('.warnings').collapse("show");
        }
      });
  }
}

function remove() {
  var val = $('#removeInput').val().replace('?', '-q-');
  while (val.includes('//')) {
    val = val.replace('//', '-slash-');
  }
  if (val.length > 0) {
    fetch('/cube/api/getcardfromcube/' + $('#cubeID').val() + ';' + val)
      .then(response => response.json())
      .then(function(json) {
        if (json.card) {
          if ($('#addInput').val().length > 0) {
            var val2 = $('#addInput').val().replace('?', '-q-');
            while (val2.includes('//')) {
              val2 = val2.replace('//', '-slash-');
            }
            fetch('/cube/api/getcard/' + val2)
              .then(response2 => response2.json())
              .then(function(json2) {
                if (json2.card) {
                  $('#addInput').val('');
                  $('#removeInput').val('');
                  changes.push({
                    replace: [json.card, json2.card]
                  })
                  updateCollapse();
                  $('.warnings').collapse("hide");
                } else {
                  $('.warnings').collapse("show");
                }
              });
          } else {
            $('#removeInput').val('');
            changes.push({
              remove: json.card
            })
            updateCollapse();
            $('.warnings').collapse("hide");
          }
        } else {
          $('.warnings').collapse("show");
        }
      });
  }
}

function updateCollapse() {
  var val = "";
  changes.forEach(function(change, index) {
    val += "<a class='clickx' id='clickx" + index + "' href=#>x</a> ";
    if (change.add) {
      val += '<span class="badge badge-success">+</span> ';
      if (change.add.image_flip) {
        val += '<a class="dynamic-autocard" card="' + change.add.image_normal + '" card_flip="' + change.add.image_flip + '">' + change.add.name + '</a>';
      } else {
        val += '<a class="dynamic-autocard" card="' + change.add.image_normal + '">' + change.add.name + '</a>';
      }
    } else if (change.remove) {
      val += '<span class="badge badge-danger">–</span> ';
      if (change.remove.image_flip) {
        val += '<a class="dynamic-autocard" card="' + change.remove.image_normal + '" card_flip="' + change.remove.image_flip + '">' + change.remove.name + '</a>';
      } else {
        val += '<a class="dynamic-autocard" card="' + change.remove.image_normal + '">' + change.remove.name + '</a>';
      }
    } else if (change.replace) {
      val += '<span class="badge badge-primary">→</span> ';
      if (change.replace[0].image_flip) {
        val += '<a class="dynamic-autocard" card="' + change.replace[0].image_normal + '" card_flip="' + change.replace[0].image_flip + '">' + change.replace[0].name + '</a> > ';
      } else {
        val += '<a class="dynamic-autocard" card="' + change.replace[0].image_normal + '">' + change.replace[0].name + '</a> > ';
      }
      if (change.replace[1].image_flip) {
        val += '<a class="dynamic-autocard" card="' + change.replace[1].image_normal + '" card_flip="' + change.replace[1].image_flip + '">' + change.replace[1].name + '</a>';
      } else {
        val += '<a class="dynamic-autocard" card="' + change.replace[1].image_normal + '">' + change.replace[1].name + '</a>';
      }
    }
    val += "<br>"
  });

  $('#changelist').html(val);

  if (val.length > 0) {
    $('.editForm').collapse("show");
  } else {
    $('.editForm').collapse("hide")
  }

  autocard_init('dynamic-autocard');
  changes.forEach(function(change, index) {
    var clickx = document.getElementById("clickx" + index);
    clickx.addEventListener("click", function(e) {
      changes.splice(index, 1);
      updateCollapse();
    });
  });
}

function getCardTagColorClass(card) {
  let res = getCardColorClass(card);
  cubeTagColors.every(function(item, index) {
    if (card.tags.includes(item.tag)) {
      if (item.color) {
        res = `tag-color tag-${item.color}`;
        return false;
      }
    }
    return true;
  });
  return res;
}

function getTagColorClass(tag) {
  let res = 'tag-no-color'
  cubeTagColors.every(function(item, index) {
    if (item.tag === tag) {
      if (item.color) {
        res = `tag-color tag-${item.color}`;
        return false;
      }
    }
    return true;
  });
  return res;
}

function GetColorIdentity(colors) {
  if (colors.length == 0) {
    return 'Colorless';
  } else if (colors.length > 1) {
    return 'Multicolored';
  } else if (colors.length == 1) {
    switch (colors[0]) {
      case "W":
        return 'White';
        break;
      case "U":
        return 'Blue';
        break;
      case "B":
        return 'Black';
        break;
      case "R":
        return 'Red';
        break;
      case "G":
        return 'Green';
        break;
      case "C":
        return 'Colorless';
        break;
    }
  }
}

function getSorts() {
  return ['Artist', 'CMC', 'Color Category', 'Color Count', 'Color Identity', 'Color', 'Date Added', 'Guilds', 'Legality', 'Loyalty', 'Manacost Type', 'Power', 'Price', 'Price Foil', 'Rarity', 'Set', 'Shards / Wedges', 'Status', 'Subtype', 'Supertype', 'Tags', 'Toughness', 'Type', 'Types-Multicolor', 'Unsorted'];
}

function getLabels(sort) {
  if (sort == 'Color Category') {
    return ['White', 'Blue', 'Black', 'Red', 'Green', 'Multicolored', 'Colorless', 'Lands'];
  } else if (sort == 'Color Identity') {
    return ['White', 'Blue', 'Black', 'Red', 'Green', 'Multicolored', 'Colorless'];
  } else if (sort == 'CMC') {
    return ['0', '1', '2', '3', '4', '5', '6', '7', '8+'];
  } else if (sort == 'CMC2') {
    return ['0-1', '2', '3', '4', '5', '6', '7+'];
  } else if (sort == 'Color') {
    return ['White', 'Blue', 'Black', 'Red', 'Green', 'Colorless'];
  } else if (sort == 'Type') {
    return ['Creature', 'Planeswalker', 'Instant', 'Sorcery', 'Artifact', 'Enchantment', 'Conspiracy', 'Contraption', 'Phenomenon', 'Plane', 'Scheme', 'Vanguard', 'Land', 'Other'];
  } else if (sort == 'Supertype') {
    return ['Snow', 'Legendary', 'Tribal', 'Basic', 'Elite', 'Host', 'Ongoing', 'World'];
  } else if (sort == 'Tags') {
    var tags = [];
    cube.forEach(function(card, index) {
      card.tags.forEach(function(tag, index2) {
        if (tag.length > 0 && !tags.includes(tag)) {
          tags.push(tag);
        }
      });
    });
    return tags.sort();
  } else if (sort == 'Date Added') {
    var days = [],
      formattedDay;
    cube.forEach(function(card, index) {
      formattedDay = ISODateToYYYYMMDD(card.addedTmsp);
      if (formattedDay === undefined) {
        formattedDay = "unknown";
      }
      if (!days.includes(formattedDay)) {
        days.push(formattedDay);
      }
    });
    return days.sort();
  } else if (sort == 'Status') {
    return ['Not Owned', 'Ordered', 'Owned', 'Premium Owned'];
  } else if (sort == 'Guilds') {
    return ['Azorius', 'Dimir', 'Rakdos', 'Gruul', 'Selesnya', 'Orzhov', 'Golgari', 'Simic', 'Izzet', 'Boros'];
  } else if (sort == 'Shards / Wedges') {
    return ['Bant', 'Esper', 'Grixis', 'Jund', 'Naya', 'Abzan', 'Jeskai', 'Sultai', 'Mardu', 'Temur'];
  } else if (sort == 'Color Count') {
    return ['0', '1', '2', '3', '4', '5'];
  } else if (sort == 'Set') {
    var sets = [];
    cube.forEach(function(card, index) {
      if (!sets.includes(card.details.set.toUpperCase())) {
        sets.push(card.details.set.toUpperCase());
      }
    });
    return sets.sort();
  } else if (sort == 'Artist') {
    var artists = [];
    cube.forEach(function(card, index) {
      if (!artists.includes(card.details.artist)) {
        artists.push(card.details.artist);
      }
    });
    return artists.sort();
  } else if (sort == 'Rarity') {
    return ['Common', 'Uncommon', 'Rare', 'Mythic'];
  } else if (sort == 'Unsorted') {
    return ['All'];
  } else if (sort == 'Subtype') {
    var types = [];
    cube.forEach(function(card, index) {
      if (card.type_line.includes('—')) {
        var subtypes = card.type_line.substr(card.type_line.indexOf('—') + 1).split(' ');
        subtypes.forEach(function(subtype, index) {
          if (!types.includes(subtype.trim()) && subtype.trim().length > 0) {
            types.push(subtype.trim());
          }
        });
      }
    });
    return types.sort();
  } else if (sort == 'Types-Multicolor') {
    return ['Creature', 'Planeswalker', 'Instant', 'Sorcery', 'Artifact', 'Enchantment', 'Conspiracy', 'Contraption', 'Phenomenon', 'Plane', 'Scheme', 'Vanguard', 'Azorius', 'Dimir', 'Rakdos', 'Gruul', 'Selesnya', 'Orzhov', 'Golgari', 'Simic', 'Izzet', 'Boros',
      'Bant', 'Esper', 'Grixis', 'Jund', 'Naya', 'Abzan', 'Jeskai', 'Sultai', 'Mardu', 'Temur', 'Non-White', 'Non-Blue', 'Non-Black', 'Non-Red', 'Non-Green', 'Five Color', 'Land', 'Other'
    ];
  } else if (sort == 'Legality') {
    return ['Standard', 'Modern', 'Legacy', 'Vintage', 'Pauper'];
  } else if (sort == 'Power') {
    var items = [];
    cube.forEach(function(card, index) {
      if (card.details.power) {
        if (!items.includes(card.details.power)) {
          items.push(card.details.power);
        }
      }
    });
    return items.sort(function(x, y) {
      if (!(/^\d+$/.test(x)) || !(/^\d+$/.test(y))) {
        if (x > y) {
          return 1;
        } else if (y > x) {
          return -1;
        }
        return 1;
      }
      if (parseInt(x) > parseInt(y)) {
        return 1;
      } else if (parseInt(y) > parseInt(x)) {
        return -1;
      }
      return 1;
    });
  } else if (sort == 'Toughness') {
    var items = [];
    cube.forEach(function(card, index) {
      if (card.details.toughness) {
        if (!items.includes(card.details.toughness)) {
          items.push(card.details.toughness);
        }
      }
    });
    return items.sort(function(x, y) {
      if (!(/^\d+$/.test(x)) || !(/^\d+$/.test(y))) {
        if (x > y) {
          return 1;
        } else if (y > x) {
          return -1;
        }
        return 1;
      }
      if (parseInt(x) > parseInt(y)) {
        return 1;
      } else if (parseInt(y) > parseInt(x)) {
        return -1;
      }
      return 1;
    });
  } else if (sort == 'Loyalty') {
    var items = [];
    cube.forEach(function(card, index) {
      if (card.details.loyalty) {
        if (!items.includes(card.details.loyalty)) {
          items.push(card.details.loyalty);
        }
      }
    });
    return items.sort(function(x, y) {
      if (!(/^\d+$/.test(x)) || !(/^\d+$/.test(y))) {
        if (x > y) {
          return 1;
        } else if (y > x) {
          return -1;
        }
        return 1;
      }
      if (parseInt(x) > parseInt(y)) {
        return 1;
      } else if (parseInt(y) > parseInt(x)) {
        return -1;
      }
      return 1;
    });
  } else if (sort == 'Manacost Type') {
    return ['Gold', 'Hybrid', 'Phyrexian'];
  } else if (sort == 'CNC') {
    return ['Creature', 'Non-Creature'];
  } else if (sort == 'Price' || sort == 'Price Foil') {
    var labels = [];
    for (i = 0; i <= price_buckets.length; i++) {
      labels.push(price_bucket_label(i));
    }
    labels.push("No Price Available");
    return labels;
  } else if (sort == 'Unsorted') {
    return ['All'];
  }
}

function getCardColorClass(card) {
  var type = card.type_line;
  var colors = card.colors;
  if (type.toLowerCase().includes('land')) {
    return 'lands';
  } else if (colors.length == 0) {
    return 'colorless';
  } else if (colors.length > 1) {
    return 'multi';
  } else if (colors.length == 1) {
    switch (colors[0]) {
      case "W":
        return 'white';
        break;
      case "U":
        return 'blue';
        break;
      case "B":
        return 'black';
        break;
      case "R":
        return 'red';
        break;
      case "G":
        return 'green';
        break;
      case "C":
        return 'colorless';
        break;
    }
  }
}

function sortIntoGroups(cards, sort) {
  var groups = {};
  var labels = getLabels(sort);
  labels.forEach(function(label, index) {
    group = [];

    cards.forEach(function(card, cardindex) {
      if (cardIsLabel(card, label, sort)) {
        group.push(card);
      }
    });

    if (group.length > 0) {
      groups[label] = group;
    }
  });
  return groups;
}

function columnLength(sort, label) {
  var res = 0;
  var cards = filteredCube();

  cards.forEach(function(card, cardindex) {
    if (cardIsLabel(card, label, sort)) {
      res += 1;
    }
  });
  return res;
}

var updateCubeListeners = [];

function updateCubeList() {
  updateCubeListeners.forEach(listener => listener(cube));
  autocard_init('autocard');
  autocard_hide_card();
}

var prev_handler = window.onload;
window.onload = function() {
  if (prev_handler) {
    prev_handler();
  }
  updateCubeList();
  activateTags();
};
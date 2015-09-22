jQuery(function($){
	var overlay = $('<div id=\"overlay\"></div>').appendTo($('body'))

	$('.nks_location').click(function(e){
		e.preventDefault();
		var t = $(this);
		t.closest('.settings-form-row').addClass('open');
		$('body').addClass('ov-visible');

		return false;
	})

	overlay.add('.close_pop').click(function(){
		$('.settings-form-row.open').removeClass('open');
		$('body').removeClass('ov-visible');
		return false;
	});

	var displays = $('.display-sbmt');

	displays.bind('click', function(e){
		var t = $(this);
		var p = t.closest('.settings-form-row');
		var current = p.find('.loc_popup')
		var hidden = p.find('input:hidden');
		var user = current.find('[id*=user_status]').val();
		var rule = current.find('[id*=display_rule]').val();
		var mobile = current.find('[id*=display_mobile]').val();
		var ids = current.find('[id*=display_ids]').val();
		debugger

		var resulted = {
			'user' : {
				'everyone' : user === 'everyone' ? 1 : 0,
				'loggedin' : user === 'loggedin' ? 1 : 0,
				'loggedout' : user === 'loggedout' ? 1 : 0
			},
			'mobile' : {
				'yes' : mobile === 'yes' ? 1 : 0,
				'no' : mobile === 'no' ? 1 : 0
			},

			'rule' : {
				'include' : rule === 'include' ? 1 : 0,
				'exclude' : rule === 'exclude' ? 1 : 0
			},
			'location' : {
				'pages' : traversePages(current.find('input[id*=display_page]')),
				'cposts' : traversePages(current.find('input[id*=display_cpost]')),
				'cats' : traversePages(current.find('input[id*=display_cat]')),
				'taxes' : {},
				'langs' : traversePages(current.find('input[id*=display_lang]')),
				'wp_pages' : traversePages(current.find('input[id*=display_wp_page]')),
				'ids': ids.split(',')
			}
		};

		hidden.val(JSON.stringify(resulted));

	});

	function traversePages(pages) {
		var res = {};

		pages.each(function(i, el){
			var t = $(el);
			var val = t.val();
			if (t.is(':checked')) res[val] = 1;
		});

		return res
	}

	$('#ns-options-wrap form').submit(function(e){
		console.log('pre submit');
//  return false
	});
})
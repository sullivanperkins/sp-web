<div id="ns-options-wrap" class="widefat" style="opacity: 0;">
<?php
    function custom_do_settings_sections($page) {
        global $wp_settings_sections, $wp_settings_fields;

        if ( !isset($wp_settings_sections) || !isset($wp_settings_sections[$page]) )
            return;

        foreach( (array) $wp_settings_sections[$page] as $section ) {
            echo "<div class='postbox' id='{$section['id']}'><h3 class='hndle'><span>{$section['title']}</span></h3>\n";
            call_user_func($section['callback'], $section);
            if ( !isset($wp_settings_fields) ||
                 !isset($wp_settings_fields[$page]) ||
                 !isset($wp_settings_fields[$page][$section['id']]) )
                    continue;
            echo '<div class="settings-form-wrapper '. $section['id'] . '">';
            custom_do_settings_fields($page, $section['id']);
            echo "<input name='Submit' type='submit' id='sbmt_{$section['id']}' class='button-primary' value='Save Changes' />";
            echo '</div></div>';
        }
    }

    function custom_do_settings_fields($page, $section) {
        global $wp_settings_fields;

        if ( !isset($wp_settings_fields) ||
             !isset($wp_settings_fields[$page]) ||
             !isset($wp_settings_fields[$page][$section]) )
            return;

        foreach ( (array) $wp_settings_fields[$page][$section] as $field ) {
            echo '<div class="settings-form-row'. (!empty($field['args']['hidden']) ? ' hidden-row' : '') . ' ' . $field['id'] .'">';
            if ( !empty($field['args']['label_for']) ) {
                echo '<p><label for="' . $field['args']['label_for'] . '">' . $field['title'] . '</label><br />';
            }
            else {
                echo '<p class="'. (!empty($field['args']['header_hidden']) ? 'header_hidden' : '') . '"><span class="field-title">' . $field['title'] . '</span>';
            }
            call_user_func($field['callback'], $field['args']);
            echo '</p></div>';
        }
    }
    screen_icon();
?>

<h2 class="form-title">Ninja Kick: Sliding Panel settings</h2>
<form method="post" action="options.php" enctype="multipart/form-data">
    <ul id="tabs"></ul>

	<?php settings_fields('nks_cc_options'); ?>
<?php custom_do_settings_sections('nks_cc'); ?>

</form>
		
		<div class="la">
        <a href="http://www.looks-awesome.com/"><img src="<?php echo plugins_url('/img/', __FILE__); ?>LA2.png" alt=""> <!--by Looks Awesome--></a>
		</div>
    <div id="tabs-preview"><a href="#" id="add-tab"><i class='fa fa-plus-circle'></i><br>Add tab</div></a>

	<div id="fade-overlay">
		<div class="svg-wrapper">
			<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100px" height="120px" viewBox="0 0 100 120" style="enable-background:new 0 0 50 50;" xml:space="preserve">
    <rect x="0" y="0" width="10" height="35" fill="#333" transform="translate(0 19.2561)">
	    <animateTransform attributeType="xml" attributeName="transform" type="translate" values="0 0; 0 25; 0 0" begin="0" dur="0.6s" repeatCount="indefinite"></animateTransform>
    </rect>
				<rect x="20" y="0" width="10" height="35" fill="#333" transform="translate(0 5.92276)">
					<animateTransform attributeType="xml" attributeName="transform" type="translate" values="0 0; 0 25; 0 0" begin="0.2s" dur="0.6s" repeatCount="indefinite"></animateTransform>
				</rect>
				<rect x="40" y="0" width="10" height="35" fill="#333" transform="translate(0 7.41058)">
					<animateTransform attributeType="xml" attributeName="transform" type="translate" values="0 0; 0 25; 0 0" begin="0.4s" dur="0.6s" repeatCount="indefinite"></animateTransform>
				</rect>
  </svg>
		</div>

	</div>
</div>
<script type="text/javascript">
    (function(){
        var $ = window.jQuery;
        var current;
		    var $tabs;
		    var $active;
		    var $content;
		    var $wrap;
		    var $saved;
		    var $sbmt;
		    var offset;
		    var $win;
		    var isLS = 'sessionStorage' in window && window['sessionStorage'] !== null;

	    function showLoadingView () {
		    $('#fade-overlay').addClass('loading');
	    }

        if($ != null) {

	          try {
		          $wrap = $('#ns-options-wrap')
		          $tabs = $('#tabs');
		          $win = $(window);

		          $(function(){

			          $('#ns-options-wrap .postbox').each(function(i ,el) {
				          var $t = $(this);
				          var txt = $t.find('h3').text();
				          var active = isLS && sessionStorage.getItem('nks-section') && $t.attr('id') === sessionStorage.getItem('nks-section').replace('for_', '') ? 'active' : '';
				          $tabs.append('<li id="for_'+  $t.attr('id') + '" class="'+ active + '"><span data-hover="'+txt+'">' + txt + '</span></li>');
			          });

			          $('#wpcontent').prepend('<div class="ninja"></div>');

			          // $('.ninja').css('left', $('#adminmenuwrap').width())

			          if (isLS) {

				          current = sessionStorage.getItem('nks-section');

				          $active = current ? $('#tabs li#' + current) : $('#tabs li:first');
				          $content = $wrap.find('#' + $active.attr('id').replace('for_', ''))


				          $content.add($active).addClass('active');
				          //$wrap.height($content.outerHeight() + 150)

				          // chrome fix
				          //setTimeout(function(){$wrap.height($content.outerHeight() + 150)}, 500)

				          current = sessionStorage.getItem('nks-section-scroll');

				          if (current) {
					          $('html, body').scrollTop(current)
				          }

			          }

			          $tabs.find('li').click(function () {
				          var $t = $(this);
				          var $content = $('#ns-options-wrap #' + $t.attr('id').replace('for_', ''));

				          if ($saved) $saved.hide();

				          $wrap.find('.postbox, #tabs li' ).removeClass('active')
				          $t.add($content).addClass('active');


				          //$wrap.css('transition', 'none').height($content.outerHeight() + 150);
				          setTimeout(function(){$wrap.css('transition', 'height 0.3s ease')}, 0)

				          if (isLS) {
					          sessionStorage.setItem('nks-section', $t.attr('id'));
				          }

				          $win.scroll()

			          })

			          var lastFocusTextarea = false;

			          $wrap.find('textarea').focus(function (e) {
				          $(this).addClass('focus');
				          var c = $wrap.height()
				          if (!lastFocusTextarea) {
					          //$wrap.height(c + 240)
				          }
				          lastFocusTextarea = true;
			          }).blur(function () {
				          var $t = $(this);
				          setTimeout(function () {
					          var target = document.activeElement;

					          if ($(document.activeElement).is('button')) return;

					          var c = $wrap.height()
					          if (!lastFocusTextarea) {
						          //$wrap.height(c - 240);
					          }
					          lastFocusTextarea = true;
					          $t.removeClass('focus');

					          if (!$(target).is('textarea')) {
						          var c = $wrap.height()
						          //$wrap.height(c - 240);
						          lastFocusTextarea = false
					          }
				          }, 1);
			          })

			          if (isLS) {
				          $(window).unload(function (e) {
					          sessionStorage.setItem('nks-section-scroll', $('body').scrollTop() || $('html').scrollTop());
				          });

				          $wrap.find(':submit').click(function(){
					          showLoadingView();
					          sessionStorage.setItem('nks-section-submit', $(this).attr('id'));
				          });

				          if (sessionStorage.getItem('nks-section-submit')) {
					          $saved = $('<div id="saved"><i class="fa fa-check"></i> Saved!</div>');
					          $sbmt = $('#' + sessionStorage.getItem('nks-section-submit')).not('.display-sbmt');

					          if ($sbmt.length) {
						          //$('body').append($saved);
						          offset = $sbmt.offset();
						          setTimeout(function(){$saved.addClass('hide')}, 1000);

//						          $saved.css({top: offset.top + 5, left: $sbmt.outerWidth() + offset.left + 10})

					          }
					          sessionStorage.setItem('nks-section-submit', '');

				          }

				          var $tab = $('#for_nks_cc_custom');
				          var $anchors = $('[class*=nks_cc_label_color]');
				          var $preview = $('#tabs-preview');

				          if (!$preview.find('.active').length) $preview.children().first().addClass('active')

				          function isScrolledIntoView() {
					          if (!$tab.is('.active')) {
						          $preview.find('.active').removeClass('active');
						          return;
					          }

					          var wh = $win.height();
					          var docViewTop = $win.scrollTop();
					          var docViewBottom = docViewTop + wh;

					          $anchors.each(function(i, el){
						          var $t = $(this);
						          var elemTop = $t.offset().top;
						          var elemBottom = elemTop + (wh > 450 ? 450 : wh - 200)/*+ $elem.height()*/; // when element scrolls into view
						          var $child = $preview.children().eq(i);

						          if (((elemBottom <= docViewBottom) && (elemTop >= docViewTop))) {
							          $child.addClass('active');
						          } else {
							          if ($preview.find('.active').not($child).length){

								          $child.removeClass('active');
							          }
						          }
					          })

				          }

				          $win.scroll(isScrolledIntoView).scroll()

				          $preview.children('[id*=preview]').click(function(e){
					          if (!$tab.is('.active')) {
						          $tab.click();
					          }

					          var index = $(this).attr('id').match(/\d/)[0];

					          $('html, body').animate({
						          scrollTop: $('.nks_cc_label_color_' + index).offset().top - 100
					          }, 600);
				          })

				          if (sessionStorage.getItem('nks-add-tab')) {

					          if (!$tab.is('.active')) {
						          $tab.click();
					          }

					          $('html, body').animate({
						          scrollTop: $('.nks_cc_label_color_' + sessionStorage.getItem('nks-add-tab')).offset().top - 50
					          }, 600);

					          sessionStorage.setItem('nks-add-tab', '')
				          }


			          }

			          $wrap.css('opacity', 1);
		          });
	          } catch (e) {
		          document.getElementById('ns-options-wrap').style.opacity = 1;
	          }

        } else {
	        document.getElementById('ns-options-wrap').style.opacity = 1;

        }
    }())

</script>

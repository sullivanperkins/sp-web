<?php

add_action( 'admin_init', 'nks_cc_register_settings' );

function nks_cc_register_settings() {

	$options = nks_cc_get_options();

	register_setting( 'nks_cc_options', 'nks_cc_options', 'nks_cc_options_validate' );

	add_settings_section('nks_cc_custom', 'Tabs', 'nks_section', 'nks_cc');

	for ($i = 1; $i <= $options['nks_cc_tabs']; $i++) {
		add_settings_field('nks_cc_display_' . $i, "Tabs", 'nks_cc_display_str', 'nks_cc', 'nks_cc_custom', array('index' => $i, 'header_hidden' => true));
		add_settings_field('nks_cc_label_color_' . $i, "Button color for Tab " . $i . ":", 'nks_cc_label_color_str', 'nks_cc', 'nks_cc_custom', array('index' => $i));
		add_settings_field('nks_cc_fa_icon_' . $i, "Name of Font Awesome icon to display on button for Tab " . $i . " (find list <a href='http://fortawesome.github.io/Font-Awesome/icons/' target='_blank'>here</a>):", 'nks_cc_fa_icon_str', 'nks_cc', 'nks_cc_custom', array('index' => $i));
		add_settings_field('nks_cc_label_style_' . $i, "Button style for Tab " . $i . ":", 'nks_cc_label_style_str', 'nks_cc', 'nks_cc_custom', array('index' => $i));
		add_settings_field('nks_cc_tab_bg_' . $i, "Tab " . $i . " Background Color", 'nks_cc_tab_bg_str', 'nks_cc', 'nks_cc_custom', array('index' => $i));
		add_settings_field('nks_cc_tab_image_bg_' . $i, 'Tab ' . $i . ' Background Image:', 'nks_cc_tab_image_bg_str', 'nks_cc', 'nks_cc_custom', array('index' => $i));
		add_settings_field('nks_cc_tab_tooltip_' . $i, 'Tab ' . $i . ' button tooltip:', 'nks_cc_tab_tooltip_str', 'nks_cc', 'nks_cc_custom', array('index' => $i));
		add_settings_field('nks_cc_css_' . $i, "Content CSS for Tab " . $i . ":", 'nks_cc_css_str', 'nks_cc', 'nks_cc_custom', array('index' => $i));
		add_settings_field('nks_cc_content_' . $i, "Content to show in sidebar when Tab " . $i . " button is clicked (can be HTML or shortcode or both):", 'nks_cc_content_str', 'nks_cc', 'nks_cc_custom', array('index' => $i));
	}
	add_settings_field('nks_cc_tabs', "Tabs", 'nks_cc_tabs_str', 'nks_cc', 'nks_cc_custom', array('hidden' => true));
//	browser()->log('NKS');


	add_settings_section('nks_cc_sidebar', 'Sidebar', 'nks_section', 'nks_cc');
	add_settings_field('nks_cc_sidebar_type', "The way sidebar appears:", 'nks_cc_sidebar_type_str', 'nks_cc', 'nks_cc_sidebar');
	add_settings_field('nks_cc_sidebar_pos', "Sidebar position:", 'nks_cc_sidebar_pos_str', 'nks_cc', 'nks_cc_sidebar');
	add_settings_field('nks_cc_sidebar_width', "Sidebar area width in pixels (recommended less than 500):", 'nks_cc_sidebar_width_str', 'nks_cc', 'nks_cc_sidebar');
	add_settings_field('nks_cc_sidebar_scale', "Sidebar content scaling", 'nks_cc_sidebar_scale_str', 'nks_cc', 'nks_cc_sidebar');
	add_settings_field('nks_cc_base_color', "Sidebar Background Color", 'nks_cc_base_color_str', 'nks_cc', 'nks_cc_sidebar');
//	add_settings_field('nks_cc_image_bg', 'Sidebar Background Image:', 'nks_cc_image_bg_str', 'nks_cc', 'nks_cc_sidebar');
//	add_settings_field('nks_cc_custom_bg', 'Your custom background:', 'nks_cc_custom_bg_str', 'nks_cc', 'nks_cc_sidebar');

	add_settings_section('nks_cc_label', 'Buttons', 'nks_section', 'nks_cc');
	add_settings_field('nks_cc_label_size', "Buttons' size:", 'nks_cc_label_size_str', 'nks_cc', 'nks_cc_label');
	add_settings_field('nks_cc_label_tooltip', "Buttons' tooltip:", 'nks_cc_label_tooltip_str', 'nks_cc', 'nks_cc_label');
	add_settings_field('nks_cc_tooltip_color', "Buttons' tooltip color:", 'nks_cc_tooltip_color_str', 'nks_cc', 'nks_cc_label');
	add_settings_field('nks_cc_metro', "Buttons' Metro-style shape (global setting, overrides styles set up for each button):", 'nks_cc_metro_str', 'nks_cc', 'nks_cc_label');
	add_settings_field('nks_cc_label_invert', "Buttons' colors invert:", 'nks_cc_label_invert_str', 'nks_cc', 'nks_cc_label');
//	add_settings_field('nks_cc_label_stroke', "Buttons' shape stroke:", 'nks_cc_label_stroke_str', 'nks_cc', 'nks_cc_label');
//	add_settings_field('nks_cc_label_no_anim', "Buttons' spinning animation on hover:", 'nks_cc_label_no_anim_str', 'nks_cc', 'nks_cc_label');
	add_settings_field('nks_cc_label_top', "Buttons' CSS 'top' value for desktops (please enter CSS valid value like '50%' or '200px'):", 'nks_cc_label_top_str', 'nks_cc', 'nks_cc_label');
	add_settings_field('nks_cc_label_top_mob', "CSS 'top' value for mobiles:", 'nks_cc_label_top_mob_str', 'nks_cc', 'nks_cc_label');
	add_settings_field('nks_cc_label_vis', "Buttons' visibility:", 'nks_cc_label_vis_str', 'nks_cc', 'nks_cc_label');


	add_settings_section('nks_cc_mode', 'Test mode', 'nks_section', 'nks_cc');
	add_settings_field('nks_cc_test_mode', "Test mode during setup", 'nks_cc_test_mode_str', 'nks_cc', 'nks_cc_mode');

	add_settings_section('nks_cc_other', 'Other', 'nks_section', 'nks_cc');
  add_settings_field('nks_cc_selectors', "Elements to open sidebar (please enter valid CSS selectors ex. #id and .class, divided by comma):", 'nks_cc_selectors_str', 'nks_cc', 'nks_cc_other');
  add_settings_field('nks_cc_fade_content', "Fade out main content when sidebar is exposed:", 'nks_cc_fade_content_str', 'nks_cc', 'nks_cc_other');
}

function nks_section() {

}

$nks_cc_cached_opts;

function nks_cc_get_options()
{
	global $nks_cc_cached_opts;

	if (isset($nks_cc_cached_opts)) return $nks_cc_cached_opts;

	$options = get_option('nks_cc_options');
	$locations = nks_get_locations();
	//browser()->log('found locations');
	//browser()->log($locations);

	if (empty($options['nks_cc_tabs'])) {
		$options['nks_cc_tabs'] = 1;
	}

	if (empty($options['nks_cc_test_mode'])) {
		$options['nks_cc_test_mode'] = '';
	}

	if (empty($options['nks_cc_base_color'])) {
		$options['nks_cc_base_color'] = '#333333';
	}

	if (empty($options['nks_cc_image_bg'])) {
		$options['nks_cc_image_bg'] = 'none';
	}

	if (empty($options['nks_cc_custom_bg'])) {
		$options['nks_cc_custom_bg'] = '';
	}

	if (empty($options['nks_cc_fade_content'])) {
		$options['nks_cc_fade_content'] = 'light';
	}

	if (empty($options['nks_cc_selectors'])) {
		$options['nks_cc_selectors'] = '';
	}

	if (empty($options['nks_cc_sidebar_type'])) {
		$options['nks_cc_sidebar_type'] = 'push';
	}
	if (empty($options['nks_cc_sidebar_pos'])) {
		$options['nks_cc_sidebar_pos'] = 'right';
	}

	if (empty($options['nks_cc_sidebar_width'])) {
		$options['nks_cc_sidebar_width'] = '400';
	}

	if (empty($options['nks_cc_sidebar_scale'])) {
		$options['nks_cc_sidebar_scale'] = '';
	}

	if (empty($options['nks_cc_label_color_1'])) {
		$options['nks_cc_label_color_1'] = '#2bc0af';
	}
	if (empty($options['nks_cc_label_color_2'])) {
		$options['nks_cc_label_color_2'] = '#2b8ac0';
	}
	if (empty($options['nks_cc_label_color_3'])) {
		$options['nks_cc_label_color_3'] = '#c02b74';
	}
	if (empty($options['nks_cc_label_color_4'])) {
		$options['nks_cc_label_color_4'] = '#e4df07';
	}

	if (empty($options['nks_cc_tab_bg_1'])) {
		$options['nks_cc_tab_bg_1'] = '#2bc0af';
	}
	if (empty($options['nks_cc_tab_bg_2'])) {
		$options['nks_cc_tab_bg_2'] = '#2b8ac0';
	}
	if (empty($options['nks_cc_tab_bg_3'])) {
		$options['nks_cc_tab_bg_3'] = '#c02b74';
	}
	if (empty($options['nks_cc_tab_bg_4'])) {
		$options['nks_cc_tab_bg_4'] = '#e4df07';
	}

	if (empty($options['nks_cc_label_style_1'])) {
		$options['nks_cc_label_style_1'] = 'circle';
	}
	if (empty($options['nks_cc_label_style_2'])) {
		$options['nks_cc_label_style_2'] = 'square';
	}
	if (empty($options['nks_cc_label_style_3'])) {
		$options['nks_cc_label_style_3'] = 'circle';
	}
	if (empty($options['nks_cc_label_style_4'])) {
		$options['nks_cc_label_style_4'] = 'square';
	}

	if (empty($options['nks_cc_fa_icon_1'])) {
		$options['nks_cc_fa_icon_1'] = 'fa-bars';
	}
	if (empty($options['nks_cc_fa_icon_2'])) {
		$options['nks_cc_fa_icon_2'] = 'fa-heart';
	}
	if (empty($options['nks_cc_fa_icon_3'])) {
		$options['nks_cc_fa_icon_3'] = 'fa-paper-plane';
	}
	if (empty($options['nks_cc_fa_icon_4'])) {
		$options['nks_cc_fa_icon_4'] = 'fa-coffee';
	}


	//browser()->log('tabs num');
	//browser()->log($options['nks_cc_tabs']);

	for ($i = 1; $i <= $options['nks_cc_tabs']; $i++) {

		if (empty($options['nks_cc_label_color_' . $i])) {
			$options['nks_cc_label_color_' . $i] = '#925873';
		}

		if (empty($options['nks_cc_label_style_' . $i])) {
			$options['nks_cc_label_style_' . $i] = 'circle';
		}

		if (empty($options['nks_cc_fa_icon_' . $i])) {
			$options['nks_cc_fa_icon_' . $i] = 'fa-bars';
		}

		if (empty($options['nks_cc_css_' . $i])) {
			$options['nks_cc_css_' . $i] = '';
		}

		if (empty($options['nks_cc_tab_bg_' . $i])) {
			$options['nks_cc_tab_bg_' . $i] = '#925873';
		}
		if (empty($options['nks_cc_tab_image_bg_' . $i])) {
			$options['nks_cc_tab_image_bg_' . $i] = 'none';
		}

		if (empty($options['nks_cc_tab_tooltip_' . $i])) {
			$options['nks_cc_tab_tooltip_' . $i] = 'Tooltip ' . $i;
		}

		if (empty($options['nks_cc_content_' . $i])) {
			$options['nks_cc_content_' . $i] = '';
		}
    //reset
		//$options['nks_cc_display_' . $i] =  '';

		if (empty($options['nks_cc_display_' . $i])) {
			$opts = (object)array(
				"user" => (object)array(
					"everyone" => 1,
					"loggedin" => 0,
					"loggedout" => 0
				),
				"mobile" => (object)array(
					"yes" => 1,
					"no" => 0
				),
				"rule" => (object)array(
					"include" => 0,
					"exclude" => 1
				),
				"location" => (object)array(
					"pages" => (object)array(),
					"cposts" => (object)array(),
					"cats" => (object)array(),
					"taxes" => (object)array(),
					"langs" => (object)array(),
					"wp_pages" => (object)array(),
					"ids" => array()
				)
			);
			$options['nks_cc_display_' . $i] =  json_encode($opts);
		}

	}

	if (empty($options['nks_cc_metro'])) {
		$options['nks_cc_metro'] = '';
	}

	if (empty($options['nks_cc_label_invert'])) {
		$options['nks_cc_label_invert'] = '';
	}

	if (empty($options['nks_cc_label_stroke'])) {
		$options['nks_cc_label_stroke'] = '';
	}

	if (empty($options['nks_cc_label_top'])) {
		$options['nks_cc_label_top'] = '50%';
	}

	if (empty($options['nks_cc_label_top_mob'])) {
		$options['nks_cc_label_top_mob'] = '50px';
	}

	if (empty($options['nks_cc_label_tooltip'])) {
		$options['nks_cc_label_tooltip'] = 'hover';
	}

	if (empty($options['nks_cc_tooltip_color'])) {
		$options['nks_cc_tooltip_color'] = 'rgba(0, 0, 0, 0.7)';
	}

	if (empty($options['nks_cc_label_size'])) {
		$options['nks_cc_label_size'] = '2x';
	}

	if (empty($options['nks_cc_label_vis'])) {
		$options['nks_cc_label_vis'] = 'visible';
	}
	if (empty($options['nks_cc_label_vis_selector'])) {
		$options['nks_cc_label_vis_selector'] = '';
	}

	if (empty($options['nks_cc_label_no_anim'])) {
		$options['nks_cc_label_no_anim'] = '';
	}

	$nks_cc_cached_opts = $options;

	return $options;
}

function nks_cc_test_mode_str() {
	$options = nks_cc_get_options();
	$style = $options['nks_cc_test_mode'];
	$first_checked = $style == 'yes' ? 'checked="checked"' : '';

	echo "
	<p><input id='nks_cc_test_mode' name='nks_cc_options[nks_cc_test_mode]' type='checkbox' value='yes' {$first_checked} style='' /> <label for='nks_cc_test_mode'>Visible only for logged-in admins</label></p>
	";
}




function nks_cc_base_color_str() {
		$options = nks_cc_get_options();

    echo "<input id='nks_cc_base_color' data-color-format='hex' name='nks_cc_options[nks_cc_base_color]' type='text' value='{$options['nks_cc_base_color']}' style='' />
		<script>
				var opts = {
          previewontriggerelement: true,
          previewformat: 'hex',
          flat: false,
          color: '#3e98a8',
          customswatches: 'bg',
          swatches: [
            '#c0392b',
            'a3503c',
            '925873',
            '927758',
            '589272',
            '588c92',
            '2bb1c0',
            '2b8ac0',
            'e96701',
            'c02b74'
          ],
          order: {
              hsl: 1,
              preview: 2
          },
          onchange: function(container, color) {}
        };
				jQuery(function(){
					jQuery('#nks_cc_base_color').ColorPickerSliders(opts)
				});

	</script>
	";


}function nks_cc_tab_bg_str($args) {
		$options = nks_cc_get_options();
		$index = $args["index"];

    echo "<input id='nks_cc_tab_bg_{$index}' data-color-format='hex' name='nks_cc_options[nks_cc_tab_bg_{$index}]' type='text' value='{$options['nks_cc_tab_bg_'.$index]}' style='' />
		<script>
				var opts = {
          previewontriggerelement: true,
          previewformat: 'hex',
          flat: false,
          color: '#3e98a8',
          customswatches: 'bg',
          swatches: [
            '#c0392b',
            'a3503c',
            '925873',
            '927758',
            '589272',
            '588c92',
            '2bb1c0',
            '2b8ac0',
            'e96701',
            'c02b74'
          ],
          order: {
              hsl: 1,
              preview: 2
          },
          onchange: function(container, color) {}
        };
				jQuery(function(){
					jQuery('#nks_cc_tab_bg_{$index}').ColorPickerSliders(opts)
				});

	</script>
	";
}

function nks_cc_tab_tooltip_str ($args) {
    $options = nks_cc_get_options();
		$index = $args["index"];
    echo "<input id='nks_cc_tab_tooltip_{$index}' name='nks_cc_options[nks_cc_tab_tooltip_{$index}]' type='text' value='{$options['nks_cc_tab_tooltip_'.$index]}' style='' />
    ";
}

function nks_cc_fa_icon_str ($args) {
    $options = nks_cc_get_options();
		$index = $args["index"];
    echo "<input id='nks_cc_fa_icon_{$index}' name='nks_cc_options[nks_cc_fa_icon_{$index}]' type='text' value='{$options['nks_cc_fa_icon_'.$index]}' style='' />
    ";
}


function nks_cc_tabs_str ($args) {
    $options = nks_cc_get_options();
    echo "<input id='nks_cc_tabs' name='nks_cc_options[nks_cc_tabs]' type='hidden' value='{$options['nks_cc_tabs']}' style='' />";
	echo "
	  <script>
	  jQuery(function($){

        $('#add-tab').click(function(){
          var hidden = $('#nks_cc_tabs');
          var val = parseInt(hidden.val());
          hidden.val(val+1);

          $(this).html('<i style=\"font-size:24px\" class=\"fa fa-spin fa-circle-o-notch\"></i>')
          if (sessionStorage) sessionStorage.setItem('nks-add-tab', val+1)

		    	$('#fade-overlay').addClass('loading');

          hidden.closest('form').submit()
          return false

        })

	  })

    </script>
    ";
}

function nks_cc_tab_image_bg_str($args) {
	$options = nks_cc_get_options();
	$index = $args["index"];
    $bg = $options['nks_cc_tab_image_bg_'.$index];
		$isCustom = $bg === 'custom';
		$url = plugins_url('/img', __FILE__);


    echo "<select id='nks_cc_tab_image_bg_{$index}' name='nks_cc_options[nks_cc_tab_image_bg_{$index}]'>
    <option value='none' " . ($bg === 'none' ? 'selected="selected"' : '') . ">None</option>
    <option value='blur1' " . ($bg === 'blur1' ? 'selected="selected"' : '') . ">Blurred #1</option>
    <option value='blur2' " . ($bg === 'blur2' ? 'selected="selected"' : '') . ">Blurred #2</option>
    <option value='blur3' " . ($bg === 'blur3' ? 'selected="selected"' : '') . ">Blurred #3</option>
    <option value='blur4' " . ($bg === 'blur4' ? 'selected="selected"' : '') . ">Blurred #4</option>
    <option value='blur5' " . ($bg === 'blur5' ? 'selected="selected"' : '') . ">Blurred #5</option>
    <option value='blur6' " . ($bg === 'blur6' ? 'selected="selected"' : '') . ">Blurred #6</option>
    <option value='blur7' " . ($bg === 'blur7' ? 'selected="selected"' : '') . ">Blurred #7</option>
    <option value='blur8' " . ($bg === 'blur8' ? 'selected="selected"' : '') . ">Blurred #8</option>
    <option value='blur9' " . ($bg === 'blur9' ? 'selected="selected"' : '') . ">Blurred #9</option>
    <option value='blur10' " . ($bg === 'blur10' ? 'selected="selected"' : '') . ">Blurred #10</option>
    <option value='blur11' " . ($bg === 'blur11' ? 'selected="selected"' : '') . ">Blurred #11</option>
    <option value='blur12' " . ($bg === 'blur12' ? 'selected="selected"' : '') . ">Blurred #12</option>
    <option value='blur13' " . ($bg === 'blur13' ? 'selected="selected"' : '') . ">Blurred #13</option>
    <option value='blur14' " . ($bg === 'blur14' ? 'selected="selected"' : '') . ">Blurred #14</option>
    <option value='blur15' " . ($bg === 'blur15' ? 'selected="selected"' : '') . ">Blurred #15</option>
    <option value='pattern1' " . ($bg === 'pattern1' ? 'selected="selected"' : '') . ">Pattern #1</option>
    <option value='pattern2' " . ($bg === 'pattern2' ? 'selected="selected"' : '') . ">Pattern #2</option>
    <option value='pattern3' " . ($bg === 'pattern3' ? 'selected="selected"' : '') . ">Pattern #3</option>
    <option value='pattern4' " . ($bg === 'pattern4' ? 'selected="selected"' : '') . ">Pattern #4</option>
    <option value='pattern5' " . ($bg === 'pattern5' ? 'selected="selected"' : '') . ">Pattern #5</option>
    <option value='pattern6' " . ($bg === 'pattern6' ? 'selected="selected"' : '') . ">Pattern #6</option>
    <option value='pattern7' " . ($bg === 'pattern7' ? 'selected="selected"' : '') . ">Pattern #7</option>
    <option value='pattern8' " . ($bg === 'pattern8' ? 'selected="selected"' : '') . ">Pattern #8</option>
    <option value='pattern9' " . ($bg === 'pattern9' ? 'selected="selected"' : '') . ">Pattern #9</option>
    <option value='pattern10' " . ($bg === 'pattern10' ? 'selected="selected"' : '') . ">Pattern #10</option>
    <option value='pattern11' " . ($bg === 'pattern11' ? 'selected="selected"' : '') . ">Pattern #11</option>
    <option value='pattern12' " . ($bg === 'pattern12' ? 'selected="selected"' : '') . ">Pattern #12</option>
    <option value='pattern13' " . ($bg === 'pattern13' ? 'selected="selected"' : '') . ">Pattern #13</option>
    <option value='pattern14' " . ($bg === 'pattern14' ? 'selected="selected"' : '') . ">Pattern #14</option>
    <option value='pattern15' " . ($bg === 'pattern15' ? 'selected="selected"' : '') . ">Pattern #15</option>
    </select>
    <p id='nks_bg_preview_{$index}'><span class='content'>Background image preview</span></p>
    ";
		echo "
	  <script>
	  jQuery(function($){
        var isCustomBG = !!'{$isCustom}';
        var preview = $('#nks_bg_preview_{$index}')
        var custom = $('.nks_cc_custom_bg');
				if (isCustomBG) {
					custom.show();
				}
				$('#nks_cc_tab_image_bg_{$index}').change(function(){
           var val = $(this).val();
           var style;

           if (val === 'none' ) {
              preview.css({'backgroundImage': '', display: 'none'});
              custom.fadeOut(200);

           } else if ( val === 'custom'){
           		preview.css({'backgroundImage': '', display: 'none'});
           		custom.fadeIn(200);

           } else {
							preview.css({'backgroundImage': 'url({$url}/bg/' + val + '.jpg)', display: 'block'});
							custom.fadeOut(200);
           }

        }).change();
	  })

    </script>
    ";
}

function nks_cc_image_bg_str() {
    $options = nks_cc_get_options();
    $bg = $options['nks_cc_image_bg'];
		$isCustom = $bg === 'custom';
		$url = plugins_url('/img', __FILE__);


    echo "<select id='nks_cc_image_bg' name='nks_cc_options[nks_cc_image_bg]'>
    <option value='none' " . ($bg === 'none' ? 'selected="selected"' : '') . ">None</option>
    <!--<option value='custom' " . ($bg === 'custom' ? 'selected="selected"' : '') . ">My custom background</option>-->
    <option value='blur1' " . ($bg === 'blur1' ? 'selected="selected"' : '') . ">Blurred #1</option>
    <option value='blur2' " . ($bg === 'blur2' ? 'selected="selected"' : '') . ">Blurred #2</option>
    <option value='blur3' " . ($bg === 'blur3' ? 'selected="selected"' : '') . ">Blurred #3</option>
    <option value='blur4' " . ($bg === 'blur4' ? 'selected="selected"' : '') . ">Blurred #4</option>
    <option value='blur5' " . ($bg === 'blur5' ? 'selected="selected"' : '') . ">Blurred #5</option>
    <option value='blur6' " . ($bg === 'blur6' ? 'selected="selected"' : '') . ">Blurred #6</option>
    <option value='blur7' " . ($bg === 'blur7' ? 'selected="selected"' : '') . ">Blurred #7</option>
    <option value='blur8' " . ($bg === 'blur8' ? 'selected="selected"' : '') . ">Blurred #8</option>
    <option value='blur9' " . ($bg === 'blur9' ? 'selected="selected"' : '') . ">Blurred #9</option>
    <option value='blur10' " . ($bg === 'blur10' ? 'selected="selected"' : '') . ">Blurred #10</option>
    <option value='blur11' " . ($bg === 'blur11' ? 'selected="selected"' : '') . ">Blurred #11</option>
    <option value='blur12' " . ($bg === 'blur12' ? 'selected="selected"' : '') . ">Blurred #12</option>
    <option value='blur13' " . ($bg === 'blur13' ? 'selected="selected"' : '') . ">Blurred #13</option>
    <option value='blur14' " . ($bg === 'blur14' ? 'selected="selected"' : '') . ">Blurred #14</option>
    <option value='blur15' " . ($bg === 'blur15' ? 'selected="selected"' : '') . ">Blurred #15</option>
    <option value='pattern1' " . ($bg === 'pattern1' ? 'selected="selected"' : '') . ">Pattern #1</option>
    <option value='pattern2' " . ($bg === 'pattern2' ? 'selected="selected"' : '') . ">Pattern #2</option>
    <option value='pattern3' " . ($bg === 'pattern3' ? 'selected="selected"' : '') . ">Pattern #3</option>
    <option value='pattern4' " . ($bg === 'pattern4' ? 'selected="selected"' : '') . ">Pattern #4</option>
    <option value='pattern5' " . ($bg === 'pattern5' ? 'selected="selected"' : '') . ">Pattern #5</option>
    <option value='pattern6' " . ($bg === 'pattern6' ? 'selected="selected"' : '') . ">Pattern #6</option>
    <option value='pattern7' " . ($bg === 'pattern7' ? 'selected="selected"' : '') . ">Pattern #7</option>
    <option value='pattern8' " . ($bg === 'pattern8' ? 'selected="selected"' : '') . ">Pattern #8</option>
    <option value='pattern9' " . ($bg === 'pattern9' ? 'selected="selected"' : '') . ">Pattern #9</option>
    <option value='pattern10' " . ($bg === 'pattern10' ? 'selected="selected"' : '') . ">Pattern #10</option>
    <option value='pattern11' " . ($bg === 'pattern11' ? 'selected="selected"' : '') . ">Pattern #11</option>
    <option value='pattern12' " . ($bg === 'pattern12' ? 'selected="selected"' : '') . ">Pattern #12</option>
    <option value='pattern13' " . ($bg === 'pattern13' ? 'selected="selected"' : '') . ">Pattern #13</option>
    <option value='pattern14' " . ($bg === 'pattern14' ? 'selected="selected"' : '') . ">Pattern #14</option>
    <option value='pattern15' " . ($bg === 'pattern15' ? 'selected="selected"' : '') . ">Pattern #15</option>
    </select>
    <p id='nks_bg_preview'><span class='content'>Background image preview</span></p>
    ";
		echo "
	  <script>
	  jQuery(function($){
        var isCustomBG = !!'{$isCustom}';
        var preview = $('#nks_bg_preview')
        var custom = $('.nks_cc_custom_bg');
				if (isCustomBG) {
					custom.show();
				}
				$('#nks_cc_image_bg').change(function(){
           var val = $(this).val();
           var style;

           if (val === 'none' ) {
              preview.css({'backgroundImage': '', display: 'none'});
              custom.fadeOut(200);

           } else if ( val === 'custom'){
           		preview.css({'backgroundImage': '', display: 'none'});
           		custom.fadeIn(200);

           } else {
							preview.css({'backgroundImage': 'url({$url}/bg/' + val + '.jpg)', display: 'block'});
							custom.fadeOut(200);
           }

        }).change();
	  })

    </script>
    ";
}

function nks_cc_sidebar_width_str() {
	$options = nks_cc_get_options();
	echo " <input id='nks_cc_sidebar_width' name='nks_cc_options[nks_cc_sidebar_width]' size='10' type='text' value='{$options['nks_cc_sidebar_width']}' style='' />";
}

function nks_cc_sidebar_scale_str() {
	$options = nks_cc_get_options();
	$style = $options['nks_cc_sidebar_scale'];
	$first_checked = $style == 'yes' ? 'checked="checked"' : '';

	echo "
	<p><input id='nks_cc_sidebar_scale' name='nks_cc_options[nks_cc_sidebar_scale]' type='checkbox' value='yes' {$first_checked} style='' /> <label for='nks_cc_sidebar_scale'>Scale effect for sidebar content on opening</label></p>
	";
}

function nks_cc_custom_bg_str(  ) {
    $options = nks_cc_get_options();
    if (empty($options['nks_cc_custom_bg'])) {
        echo "<input id='nks_cc_custom_bg' type='file' name='nks_cc_custom_bg' value='{$options['nks_cc_custom_bg']}' /> <input name='Submit' type='submit' class='button-primary' value='Upload' />";
    } else {
        echo '<div class="nks_cc_custom_bg" ><img src="' . $options['nks_cc_custom_bg'] . '" alt=""/></div>';
        echo "<span>...or upload new one</span><br><input id='nks_cc_custom_bg' type='file' name='nks_cc_custom_bg' value='{$options['nks_cc_custom_bg']}' /><input name='Submit' type='submit' class='button-primary' value='Upload' />";
    }
    echo " <input id='nks_cc_custom_bg' name='nks_cc_options[nks_cc_custom_bg]' size='100' type='hidden' value='{$options['nks_cc_custom_bg']}' style='' />";
}

function nks_cc_label_color_str($args) {
	$options = nks_cc_get_options();
	$index = $args["index"];
	$shape = $options['nks_cc_label_style_' . $index ];

	echo "<div id='nks_label_preview_{$index}' ><span class='fa-stack fa-lg fa-{$options['nks_cc_label_size']}'> <i class='fa fa-{$shape} fa-stack-2x'></i> <i class='fa {$options['nks_cc_fa_icon_'.$index]} fa-stack-1x fa-inverse'></i> </span></div>";
   echo "<input id='nks_cc_label_color_{$index}' data-color-format='hex' name='nks_cc_options[nks_cc_label_color_{$index}]' type='text' value='{$options['nks_cc_label_color_'.$index]}' style='' />
	<script>

		jQuery(function(){
			var preview = jQuery('#nks_label_preview_{$index}');
			jQuery('#add-tab').before(preview);

			var opts = {
		     previewontriggerelement: true,
		     previewformat: 'hex',
		     flat: false,
		     color: '{$options['nks_cc_label_color_'.$index]}',
		     customswatches: 'label',
		     swatches: [
		       '#c0392b',
		       'a3503c',
		       '925873',
		       '927758',
		       '589272',
		       '588c92',
		       '2bb1c0',
		       '2b8ac0',
		       'e96701',
		       'c02b74'
		     ],
		     order: {
		         hsl: 1,
		         preview: 2
		     },
		     onchange: function(container, color) {
		      preview.find('.fa:not(.fa-inverse)').css('color', color.tiny.toRgbString())
		     }
   };
			jQuery('#nks_cc_label_color_{$index}').ColorPickerSliders(opts);
		});

</script>
";

}

function nks_cc_label_invert_str() {
	$options = nks_cc_get_options();
	$style = $options['nks_cc_label_invert'];
	$first_checked = $style == 'yes' ? 'checked="checked"' : '';

	echo "
	<p><input id='nks_cc_label_invert' name='nks_cc_options[nks_cc_label_invert]' type='checkbox' value='yes' {$first_checked} style='' /> <label for='nks_cc_label_invert'>Invert colors</label></p>
	";
	echo "
	  <script>
	  jQuery(function(){
	  	  var check = jQuery('#nks_cc_label_invert');

		  var icons = jQuery('#tabs-preview .fa-stack')
		  check.change(function() {
		  var checked = this.checked;

		  if (checked) {
		  	jQuery('#nks_cc_label_stroke').attr('checked', false).change();
		  }
	    icons.each(function(){
	        var preview = jQuery(this);
	        var back = preview.find('i:first');
	        var fore = preview.find('i:last');
	        var color;
	        if(checked) {
	        		jQuery('body').addClass('inverted')
	            color = back.css('color');
	            fore.removeClass('fa-inverse').css('color', color);
	            back.addClass('fa-inverse').css('color', '');
	        } else {
	        	  jQuery('body').removeClass('inverted')
	            color = fore.css('color');
	            back.removeClass('fa-inverse').css('color', color);
	            fore.addClass('fa-inverse').css('color', '');
	        }
	    })

	    });

			if (check.is(':checked')) check.change()

	  })
	   </script>
	   ";
}

function nks_cc_metro_str() {
	$options = nks_cc_get_options();
	$style = $options['nks_cc_metro'];
	$first_checked = $style == 'yes' ? 'checked="checked"' : '';

	echo "
	<p><input id='nks_cc_metro' name='nks_cc_options[nks_cc_metro]' type='checkbox' value='yes' {$first_checked} style='' /> <label for='nks_cc_metro'>Metro turned on</label></p>
	";
	echo "
	  <script>
	  jQuery(function(){

		var check = jQuery('#nks_cc_metro');

	  var icons = jQuery('#tabs-preview .fa-stack');
	  var init = true;
	  check.change(function() {
		  var checked = this.checked;
	    icons.each(function(){
	        var preview = jQuery(this);
	        var back = preview.find('i:first');
	        var fore = preview.find('i:last');
	        var color;
	        var css;

	        if(checked) {
	        	        	        	  jQuery('body').addClass('metro')

	            color = back.css('color');
	            css = {'background-color': color};
	            back.css(css);
	        } else {
	        	        	  jQuery('body').removeClass('metro')

	            color = fore.css('color');
	            back.css('background-color', '');
	        }

	        init = false;
	    })

	  });

	  			if (check.is(':checked')) check.change()

		 })
	   </script>
	   ";
}

function nks_cc_label_stroke_str() {
	$options = nks_cc_get_options();
	$style = $options['nks_cc_label_stroke'];
	$first_checked = $style == 'yes' ? 'checked="checked"' : '';

	echo "
	<p><input id='nks_cc_label_stroke' name='nks_cc_options[nks_cc_label_stroke]' type='checkbox' value='yes' {$first_checked} style='' /> <label for='nks_cc_label_stroke'>Stroke button background shape</label></p>
	";
	echo "
	  <script>
	  jQuery(function(){
	  	  var check = jQuery('#nks_cc_label_stroke');
	  	  var invert = jQuery('#nks_cc_label_invert');

		  var icons = jQuery('#tabs-preview .fa-stack')
		  check.change(function() {
				  var checked = this.checked;

				  if (checked) {
				    if (invert.is(':checked')) {
				     invert.attr('checked', false).change()
				    }
				  }
			    icons.each(function(){
			        var preview = jQuery(this);
			        var back = preview.find('i:first');
			        var fore = preview.find('i:last');
			        var color;
			        var curr = back.is('[class*=circle]') ? 'circle' : 'square';

			        if(checked) {
			        	        		jQuery('body').addClass('stroke')

			            color = back.css('color');
			            fore.removeClass('fa-inverse').css('color', color)
			            back.removeClass('fa-circle fa-square').addClass('fa-' + (curr === 'circle' ? 'circle-thin' : 'square-o'));
			            //back.addClass('fa-inverse').css('color', '');
			        } else {
			        	        		jQuery('body').removeClass('stroke')

			            //color = fore.css('color');
			            //back.removeClass('fa-inverse').css('color', color);
			            fore.addClass('fa-inverse').css('color', '');
			            back.removeClass('fa-circle-thin fa-square-o').addClass('fa-' + curr);

			        }
			    })

	    });

			if (check.is(':checked')) check.change()

	  })
	   </script>
	   ";
}

function nks_cc_selectors_str () {
	$options = nks_cc_get_options();
	echo "<input type='text' id='nks_cc_selectors' value='{$options['nks_cc_selectors']}' name='nks_cc_options[nks_cc_selectors]' value>";
}

function nks_cc_label_no_anim_str() {
	$options = nks_cc_get_options();
	$style = $options['nks_cc_label_no_anim'];
	$first_checked = $style == 'yes' ? 'checked="checked"' : '';

	echo "
	<p><input id='nks_cc_label_no_anim' name='nks_cc_options[nks_cc_label_no_anim]' type='checkbox' value='yes' {$first_checked} style='' /> <label for='nks_cc_label_no_anim'>Disable animation</label></p>
	";


}
function nks_cc_label_style_str($args) {

	$options = nks_cc_get_options();
	$index = $args["index"];
	$val = $options['nks_cc_label_style_' . $index];
	$first_checked = $val == 'circle' ? 'checked="checked"' : '';
  $sec_checked = $val == 'square' ? 'checked="checked"' : '';
//  $third_checked = $val == 'rsquare' ? 'checked="checked"' : '';

	echo "
	<p><input id='nks_cc_label_style_{$index}_circle' name='nks_cc_options[nks_cc_label_style_{$index}]' type='radio' value='circle' {$first_checked} style='' /> <label for='nks_cc_label_style_{$index}_circle'>Circle</label></p>
	<p><input id='nks_cc_label_style_{$index}_square' name='nks_cc_options[nks_cc_label_style_{$index}]' type='radio' value='square' {$sec_checked} style='' /> <label for='nks_cc_label_style_{$index}_square'>Rounded Square</label></p>
	";
	echo "
  <script>
  jQuery('input[id*=nks_cc_label_style_{$index}]').change(function(){
    var val = jQuery(this).val();
    var back = jQuery('#nks_label_preview_{$index}').find('.fa-stack-2x');
    var curr = back.is('[class*=circle]') ? 'circle' : 'square';

    back.removeClass('fa-square fa-circle fa-square-o fa-circle-thin').addClass('fa-' + val);
    if (jQuery('#nks_cc_label_stroke').is(':checked')) {
    console.log(curr)
    	back.removeClass('fa-circle fa-square').addClass('fa-' + (curr === 'circle' ? 'square-o' : 'circle-thin'));
    }

  })
   </script>
   ";
}

function nks_cc_label_top_str() {
	$options = nks_cc_get_options();
	echo " <input id='nks_cc_label_top' name='nks_cc_options[nks_cc_label_top]' size='10' type='text' value='{$options['nks_cc_label_top']}' style='' />";
}

function nks_cc_label_top_mob_str() {
	$options = nks_cc_get_options();
	echo " <input id='nks_cc_label_top_mob' name='nks_cc_options[nks_cc_label_top_mob]' size='10' type='text' value='{$options['nks_cc_label_top_mob']}' style='' />";
}

function nks_cc_label_tooltip_str() {
	$options = nks_cc_get_options();
	$val = $options['nks_cc_label_tooltip'];

	echo "<select id='nks_cc_label_tooltip' name='nks_cc_options[nks_cc_label_tooltip]'>
     <option value='hover' " . ($val === 'hover' ? 'selected="selected"' : '') . ">On button hover</option>
 		 <option value='none' " . ($val === 'none' ? 'selected="selected"' : '') . ">None</option>
 </select>";
}

function nks_cc_tooltip_color_str() {
	$options = nks_cc_get_options();

	echo "<input id='nks_cc_tooltip_color' data-color-format='rgba' name='nks_cc_options[nks_cc_tooltip_color]' type='text' value='{$options['nks_cc_tooltip_color']}' style='' />
	<script>

		jQuery(function(){

			var opts = {
		     previewontriggerelement: true,
		     previewformat: 'rgba',
		     flat: false,
		     color: '{$options['nks_cc_tooltip_color']}',
		     customswatches: 'tooltip',
		     swatches: [
		       '#c0392b',
		       'a3503c',
		       '925873',
		       '927758',
		       '589272',
		       '588c92',
		       '2bb1c0',
		       '2b8ac0',
		       'e96701',
		       'c02b74'
		     ],
		     order: {
		         rgb: 1,
		         opacity: 2,
		         preview: 3
		     }
   };
			jQuery('#nks_cc_tooltip_color').ColorPickerSliders(opts);
		});

</script>
";

}

function nks_cc_label_size_str() {
    $options = nks_cc_get_options();
    $size = $options['nks_cc_label_size'];

    echo "<select id='nks_cc_label_size' name='nks_cc_options[nks_cc_label_size]'>
    <option value='1x' " . ($size === '1x' ? 'selected="selected"' : '') . ">1x</option>
    <option value='2x' " . ($size === '2x' ? 'selected="selected"' : '') . ">2x</option>
    <option value='3x' " . ($size === '3x' ? 'selected="selected"' : '') . ">3x</option>
    </select>
    ";

	echo "
	  <script>
	  jQuery(function(){

	  })
	  jQuery('#nks_cc_label_size').change(function(){
	    var val = jQuery(this).val();
			jQuery('#tabs-preview .fa-stack').removeClass('fa-1x fa-2x fa-3x').addClass('fa-' + val);
	  }).change()

	   </script>
	   ";

}

function nks_cc_label_vis_str() {
	$options = nks_cc_get_options();
	$val = $options['nks_cc_label_vis'];
	$first_checked = $val == 'visible' ? 'checked="checked"' : '';
  $sec_checked = $val == 'hidden' ? 'checked="checked"' : '';
	$third_checked = $val == 'hidden_500' ? 'checked="checked"' : '';
	$forth_checked = $val == 'scroll' ? 'checked="checked"' : '';
	$fifth_checked = $val == 'scroll_into' ? 'checked="checked"' : '';

	echo "
	<p><input id='nks_cc_label_vis_visible' name='nks_cc_options[nks_cc_label_vis]'  type='radio' value='visible' {$first_checked} style='' /> <label for='nks_cc_label_vis_visible'>Visible</label></p>
	<p><input id='nks_cc_label_vis_hidden' name='nks_cc_options[nks_cc_label_vis]'  type='radio' value='hidden' {$sec_checked} style='' /> <label for='nks_cc_label_vis_hidden'>Don't show</label></p>
	<p><input id='nks_cc_label_vis_hidden_500' name='nks_cc_options[nks_cc_label_vis]'  type='radio' value='hidden_500' {$third_checked} style='' /> <label for='nks_cc_label_vis_hidden_500'>Don't show when screen is less than 500px wide</label></p>
	<p><input id='nks_cc_label_vis_scroll' name='nks_cc_options[nks_cc_label_vis]'  type='radio' value='scroll' {$forth_checked} style='' /> <label for='nks_cc_label_vis_scroll'>Fade in buttons only after user scrolls</label></p>
	<p><input id='nks_cc_label_vis_scroll_into' name='nks_cc_options[nks_cc_label_vis]'  type='radio' value='scroll_into' {$fifth_checked} style='' /> <label for='nks_cc_label_vis_scroll_into'>Fade in buttons only after element with selector scrolls into view.</label><br>
	<p style='padding-left: 20px;line-height: 26px;'>Please use any valid CSS selector like #id and .class (if field is empty label will be always visible)<br><input type='text' id='nks_cc_label_vis_selector' value='{$options['nks_cc_label_vis_selector']}' name='nks_cc_options[nks_cc_label_vis_selector]' value></p></p>
	";
}

function nks_cc_fade_content_str () {
    $options = nks_cc_get_options();
	  $light_checked = $options['nks_cc_fade_content'] == 'light' ? 'checked="checked"' : '';
    $dark_checked = $options['nks_cc_fade_content'] == 'dark' ? 'checked="checked"' : '';
    $none_checked = $options['nks_cc_fade_content'] == 'none' ? 'checked="checked"' : '';

	  echo "<p><input id='nks_cc_fade_content_light' name='nks_cc_options[nks_cc_fade_content]' type='radio' {$light_checked} value='light' style='' /> <label for='nks_cc_fade_content_light'>Light overlay</label></p>";
   	echo "<p><input id='nks_cc_fade_content_dark' name='nks_cc_options[nks_cc_fade_content]' type='radio' {$dark_checked} value='dark' style='' /> <label for='nks_cc_fade_content_dark'>Dark overlay</label></p>";
	echo "<p><input id='nks_cc_fade_content_none' name='nks_cc_options[nks_cc_fade_content]' type='radio' {$none_checked} value='none' style='' /> <label for='nks_cc_fade_content_none'>Don't fade (animations performance in Webkit browsers on Windows might be improved)</label></p>";

}
function nks_cc_sidebar_type_str () {
	$options = nks_cc_get_options();
	$checked1 = $options['nks_cc_sidebar_type'] === 'push' ? 'checked="checked"' : '';
	$checked2 = $options['nks_cc_sidebar_type'] === 'slide' ? 'checked="checked"' : '';

	echo "<p><input id='nks_cc_sidebar_type_push' name='nks_cc_options[nks_cc_sidebar_type]' type='radio' {$checked1} value='push' /> <label for='nks_cc_sidebar_type_push'>Pushing page content and revealing itself under it</label></p>";
	echo "<p><input id='nks_cc_sidebar_type_slide' name='nks_cc_options[nks_cc_sidebar_type]' type='radio' {$checked2} value='slide' /> <label for='nks_cc_sidebar_type_slide'>Sliding itself on the top of page content</label></p>";
}

function nks_cc_sidebar_pos_str () {
    $options = nks_cc_get_options();
    $left_checked = $options['nks_cc_sidebar_pos'] == 'left' ? 'checked="checked"' : '';
    $right_checked = $options['nks_cc_sidebar_pos'] == 'right' ? 'checked="checked"' : '';

   	echo "<p><input id='nks_cc_sidebar_pos_left' name='nks_cc_options[nks_cc_sidebar_pos]' type='radio' {$left_checked} value='left' style='' /> <label for='nks_cc_sidebar_pos_left'></label></p>";
   	echo "<p><input id='nks_cc_sidebar_pos_right' name='nks_cc_options[nks_cc_sidebar_pos]' type='radio' {$right_checked} value='right' style='' /> <label for='nks_cc_sidebar_pos_right'></label></p>";
}

function nks_cc_css_str($args)
{
    $options = nks_cc_get_options();
		$index = $args["index"];

		echo "<textarea cols='100' rows='10' id='nks_cc_css_{$index}' name='nks_cc_options[nks_cc_css_{$index}]' >" . $options['nks_cc_css_'.$index] . "</textarea>";
}

function nks_cc_content_str($args)
{
    $options = nks_cc_get_options();
	  $index = $args["index"];
    echo "<textarea cols='100' rows='10' id='nks_cc_content_{$index}' name='nks_cc_options[nks_cc_content_{$index}]' >" . $options['nks_cc_content_'.$index] . "</textarea><br>";

	  if ($options['nks_cc_tabs'] > 1) {
		  echo "<button name='Submit' type='submit' id='sbmt_delete_{$index}' class='button-primary delete' value='Delete tab'>Delete tab</button>";
		}

		//if ($index != $options['nks_cc_tabs']) {
	    echo "<button name='Submit' type='submit' id='sbmt_nks_cc_custom_{$index}' class='button-primary' value='Save Changes'>Save Changes To&nbsp;&nbsp;<i class='fa {$options['nks_cc_fa_icon_'.$index]}'></i></button>";
    //}

	  echo "<script>
				(function($){
				var index = {$index};
					var tabs = {$options['nks_cc_tabs']};
					$('#sbmt_delete_' + index).click(function() {

						 if (!confirm('Are you sure?')) return false;

						 					$('#fade-overlay').addClass('loading');


						 var _index = index - 1;
						 var colors = $('[id*=nks_cc_label_color]');
						 var icons = $('[id*=nks_cc_fa_icon]');
						 var shapes = $('[class*=nks_cc_label_style]');
						 var css = $('[id*=nks_cc_css]');
						 var content = $('[id*=nks_cc_content]');


						 colors.each(function(i, el) {
								if (i > _index) {
									colors.eq(i-1).val($(this).val())
								} else if (i === _index) {
								 	$(this).val(colors.eq(i+1))
								}
						 });

						 shapes.each(function(i, el) {
						 		var val;
						 		val = $(el).find(':checked').val();

								if (i > _index) {
										shapes.eq(i-1).find(':radio').each(function(){
										  var t = $(this);
										  if (!this.checked && t.val() === val) {
													this.checked = true;
													return false; // break
										  }
										})
								} else if (i === _index) {

								}
						 })

						 icons.each(function(i, el) {
								if (i > _index) {
									icons.eq(i-1).val($(this).val())
								} else if (i === _index){
									$(this).val(icons.eq(i+1))
								}
						 });

						 css.each(function(i, el) {
								if (i > _index) {
									css.eq(i-1).val($(this).val())
								} else if (i === _index) {
									$(this).val(css.eq(i+1))
								}
						 });

						 content.each(function(i, el) {
								if (i > _index) {
									content.eq(i-1).val($(this).val())
								} else if (i === _index) {
									$(this).val(content.eq(i+1))
								}
						 })

							$('.settings-form-row[class*=nks_cc_display] .loc_popup').each(function(i, el) {

									         var t = $(this);
										         var p = t.closest('.settings-form-row');
										         var current = t;
										         var hidden = p.find('input:hidden');

										if (i > _index) {
											$(this).find('label, :input').add(hidden).each(function(){
											  var t = $(this);
											  var _id = t.attr('id');
											  var _name = t.attr('name');
											  var _for = t.attr('for');
											  var rg = new RegExp('_' + (index + 1) + '$');

											  if (_id) {
											  	t.attr('id', _id.replace(rg, '_' + index));
											  }
											  if (_name) {
											    t.attr('name', _name.replace(rg, '_' + index));
											  }
											  if (_for) t.attr('for', _for.replace(rg, '_' + index));
											})

											hidden.attr('name', hidden.attr('name').replace(new RegExp('_' + (index + 1) + ']$'), '_' + index + ']' ))


										         var user = current.find('[id*=user_status]').val();
										         var rule = current.find('[id*=display_rule]').val();
										         var ids = current.find('[id*=display_ids]').val();

										         var resulted = {
											         'user' : {
																'everyone' : user === 'everyone' ? 1 : 0,
																'loggedin' : user === 'loggedin' ? 1 : 0,
																'loggedout' : user === 'loggedout' ? 1 : 0
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
																'langs' : {},
																'wp_pages' : traversePages(current.find('input[id*=display_wp_page]')),
																'ids': ids.split(',')
															}
										         };

										         console.log(resulted)

										         hidden.val(JSON.stringify(resulted));

										}

							});

					var hidden = $('#nks_cc_tabs');
          var val = parseInt(hidden.val());
          hidden.val(val-1);
          if (sessionStorage) sessionStorage.setItem('nks-add-tab', val-1)

          //$('.nks_cc_display_' + index + ' .display-sbmt').click()
// -- tabs
					})

					 			function traversePages(pages) {
 			   var res = {};

 			   pages.each(function(i, el){
 			     var t = $(el);
 			     var val = t.val();
 			     console.log('traverse', i , el)
 			     if (t.is(':checked')) res[val] = 1;
 			   });




 			   return res
 			}
				})(jQuery)
	  </script>";
}

function nks_cc_options_validate($plugin_options) {
    $options = get_option('plugin_options');

		if (!empty($_POST['update'])) {
	     // Get the options array defined for the form
	     foreach ($options as $option) {
          $id = $option['id'];
          //  Set the check box to "0" by default
          if ( 'checkbox' == $option['type'] && ! isset( $input[$id] ) ) {
               $input[$id] = "something";
           }
	     }
		}

		if (isset($_FILES['nks_cc_custom_bg']) && ($_FILES['nks_cc_custom_bg']['size'] > 0)) {

	    // Get the type of the uploaded file. This is returned as "type/extension"
	    $arr_file_type = wp_check_filetype(basename($_FILES['nks_cc_custom_bg']['name']));
	    $uploaded_file_type = $arr_file_type['type'];

	    // Set an array containing a list of acceptable formats
	    $allowed_file_types = array('image/jpg', 'image/jpeg', 'image/gif', 'image/png');

	    // If the uploaded file is the right format
	    if (in_array($uploaded_file_type, $allowed_file_types)) {

		    // Options array for the wp_handle_upload function. 'test_upload' => false
		    $upload_overrides = array('test_form' => false);


				//delete previous
		    //if (isset($plugin_options['nks_cc_custom_bg'])) unlink($plugin_options['nks_cc_custom_bg']);

		    $uploaded_file = wp_handle_upload($_FILES['nks_cc_custom_bg'], $upload_overrides);

		    // If the wp_handle_upload call returned a local path for the image
		    if (isset($uploaded_file['file'])) {
			    // The wp_insert_attachment function needs the literal system path, which was passed back from wp_handle_upload
			    $file_name_and_location = $uploaded_file['file'];
			    $wp_upload_dir = wp_upload_dir();
			    $plugin_options['nks_cc_custom_bg'] = $wp_upload_dir['url'] . '/' . basename($file_name_and_location);
		    } else { // wp_handle_upload returned some kind of error. the return does contain error details, so you can use it here if you want.
			    $upload_feedback = 'There was a problem with your upload.';
		    }

	    } else { // wrong file type
		    $upload_feedback = 'Please upload only image files (jpg, gif or png).';
	    }

    } else { // No file was passed
	    $upload_feedback = false;
    }
    return $plugin_options;
}


function nks_get_locations () {
	global $nks_locations;

	if (isset($nks_locations)) return $nks_locations;

	$locations = new stdClass();

	// pages on site
	$locations->pages = get_posts( array(
		'post_type' => 'page', 'post_status' => 'publish',
		'numberposts' => -1, 'orderby' => 'title', 'order' => 'ASC',
		'fields' => array('ID', 'name'),
	));

	// custom post types
	$locations->cposts = get_post_types( array(
		'public' => true,
	), 'object');

	foreach ( array( 'revision', 'post', 'page', 'attachment', 'nav_menu_item' ) as $unset ) {
		unset($locations->cposts[$unset]);
	}

	foreach ( $locations->cposts as $c => $type ) {
		$post_taxes = get_object_taxonomies($c);
		foreach ( $post_taxes as $post_tax) {
			$locations->taxes[] = $post_tax;
		}
	}

	// categories
	$locations->cats = get_categories( array(
		'hide_empty'    => false,
		//'fields'        => 'id=>name', //added in 3.8
	) );

	// WPML languages
	if (function_exists('icl_get_languages') ) {
		//browser()->log('detect langs');
		$locations->langs = icl_get_languages('skip_missing=0&orderby=code');
	}

	foreach ( $locations as $key => $val ) {

		if (!empty($val)) {
			$length = count($val);
			for ($i = 0; $i <= $length; $i++) {
				if (isset($val[$i])) {
					//browser()->log  ( $val[$i] );
				}
			}
		}
	}

	$page_types = array(
		'front'     => __('Front', 'nks-custom'),
		'home'      => __('Home/Blog', 'nks-custom'),
		'archive'   => __('Archives'),
		'single'    => __('Single Post'),
		'forbidden' => '404',
		'search'    => __('Search'),
	);

	foreach ($page_types as $key => $label){
		 //browser()->log  ( $key, $label );
		//$instance['page-'. $key] = isset($instance['page-'. $key]) ? $instance['page-'. $key] : false;
	}

	$locations->wp_pages = $page_types;

	$nks_locations = $locations;
	return $locations;
}

function nks_cc_display_str($args) {
	$options = nks_cc_get_options();
	$index = $args["index"];
	$user_opts = json_decode($options['nks_cc_display_'.$index]);
	$locations = nks_get_locations();
	//browser()->log('tab ' .$index . ' opts');
	//browser()->log($user_opts);

	?>
	<p>
		<input id='nks_cc_display_<?php echo $index?>' name='nks_cc_options[nks_cc_display_<?php echo $index?>]' type='hidden' value='<?php echo $options['nks_cc_display_'.$index]?>' />
		<a class='nks_location' href='#'><i class='fa fa-cog'></i> <span>Tab Display Options</span></a>
	<div class='loc_popup'>
		<p>
			<label for="nks_cc_user_status_<?php echo $index?>"><?php _e('Show Tab for:', 'nks-custom') ?></label>
			<select name="display_user_status_<?php echo $index?>" id="nks_cc_user_status_<?php echo $index?>" class="widefat">
				<option value="everyone" <?php echo selected( $user_opts->user->everyone, '1' ) ?>><?php _e('Everyone', 'nks-custom') ?></option>
				<option value="loggedout" <?php echo selected( $user_opts->user->loggedout, '1' ) ?>><?php _e('Logged-out users', 'nks-custom') ?></option>
				<option value="loggedin" <?php echo selected( $user_opts->user->loggedin, '1' ) ?>><?php _e('Logged-in users', 'nks-custom') ?></option>
			</select>
		</p>

		<p>
			<label for="nks_cc_display_mobile_<?php echo $index?>"><?php _e('Show on mobiles:', 'nks-custom') ?></label>
			<select name="display_mobile_<?php echo $index?>" id="nks_cc_display_mobile_<?php echo $index?>" class="widefat">
				<option value="yes" <?php echo selected( $user_opts->mobile->yes, '1' ) ?>><?php _e('Show', 'nks-custom') ?></option>
				<option value="no" <?php echo selected( $user_opts->mobile->no, '1' ) ?>><?php _e('Don\'t show', 'nks-custom') ?></option>
			</select>
		</p>

		<p>
			<label for="nks_cc_user_status_<?php echo $index?>"><?php _e('Display rule:', 'nks-custom') ?></label>

			<select name="display_rule_<?php echo $index?>" id="display_rule_<?php echo $index?>" class="widefat">
				<option value="exclude" <?php echo selected( $user_opts->rule->exclude, '1' ) ?>><?php _e('Hide on checked pages', 'nks-custom') ?></option>
				<option value="include" <?php echo selected( $user_opts->rule->include, '1' ) ?>><?php _e('Show on checked pages', 'nks-custom') ?></option>
			</select>
		</p>

		<div style="height:150px; overflow:auto; border:1px solid #dfdfdf; padding:5px; margin-bottom:5px;">
			<h4 class="dw_toggle" style="cursor:pointer;margin-top:0;"><?php _e('Default WP pages', 'nks-custom') ?></h4>
			<div class="dw_collapse">
				<?php foreach ($locations->wp_pages as $key => $label){
 					?>
					<p><input class="checkbox" type="checkbox" value="<?php echo $key?>" <?php checked(isset($user_opts->location->wp_pages->$key) ? $user_opts->location->wp_pages->$key : false, true) ?> id="display_wp_page_<?php echo $key . '_' . $index?>" name="display_wp_page_<?php echo $key . '_' . $index?>" />
						<label for="display_wp_page_<?php echo $key . '_' . $index?>"><?php echo $label .' '. __('Page', 'nks-custom') ?></label></p>
				<?php
				}
				?>
			</div>

			<h4 class="dw_toggle" style="cursor:pointer;"><?php _e('Pages') ?></h4>
			<div class="dw_collapse">
				<?php foreach ( $locations->pages as $page ) {
					//$instance['page-'. $page->ID] = isset($instance['page-'. $page->ID]) ? $instance['page-'. $page->ID] : false;
					$id = $page->ID;
					$p_title = apply_filters('the_title', $page->post_title, $page->ID);
					if ( $page->post_parent ) {
						$parent = get_post($page->post_parent);

						$p_title .= ' ('. apply_filters('the_title', $parent->post_title, $parent->ID);


						if ( $parent->post_parent ) {
							$grandparent = get_post($parent->post_parent);
							$p_title .= ' - '. apply_filters('the_title', $grandparent->post_title, $grandparent->ID);
							unset($grandparent);
						}
						$p_title .= ')';

						unset($parent);
					}
					//browser()->log($p_title);

					?>
					<p><input class="checkbox" type="checkbox" value="<?php echo $id?>" <?php checked(isset($user_opts->location->pages->$id), true) ?> id="display_page_<?php echo $id . '_' . $index?>" name="display_page_<?php echo $id . '_' . $index?>" />
						<label for="display_page_<?php echo $id . '_' . $index?>"><?php echo $p_title ?></label></p>
					<?php   unset($p_title);
				}  ?>
			</div>

			<?php if ( !empty($locations->cposts) ) { ?>
				<h4 class="dw_toggle" style="cursor:pointer;"><?php _e('Custom Post Types', 'nks-custom') ?> +/-</h4>
				<div class="dw_collapse">
					<?php foreach ( $locations->cposts as $post_key => $custom_post ) {
						?>
						<p><input class="checkbox" type="checkbox" value="<?php echo $post_key?>" <?php checked(isset($user_opts->location->cposts->$post_key), true) ?> id="display_cpost_<?php echo $post_key . '_' . $index?>" name="display_cpost_<?php echo $post_key . '_' . $index?>" />
							<label for="display_cpost_<?php echo $post_key . '_' . $index?>"><?php echo stripslashes($custom_post->labels->name) ?></label></p>
						<?php
						unset($post_key);
						unset($custom_post);
					} ?>
				</div>

				<!--<h4 class="dw_toggle" style="cursor:pointer;"><?php /*_e('Custom Post Type Archives', 'nks-custom') */?> +/-</h4>
				<div class="dw_collapse">
					<?php /*foreach ( $this->cposts as $post_key => $custom_post ) {
						if ( !$custom_post->has_archive ) {
							// don't give the option if there is no archive page
							continue;
						}
						$instance['type-'. $post_key .'-archive'] = isset($instance['type-'. $post_key .'-archive']) ? $instance['type-'. $post_key .'-archive'] : false;
						*/?>
						<p><input class="checkbox" type="checkbox" <?php /*checked($instance['type-'. $post_key.'-archive'], true) */?> id="<?php /*echo $widget->get_field_id('type-'. $post_key .'-archive'); */?>" name="<?php /*echo $widget->get_field_name('type-'. $post_key .'-archive'); */?>" />
							<label for="<?php /*echo $widget->get_field_id('type-'. $post_key .'-archive'); */?>"><?php /*echo stripslashes($custom_post->labels->name) */?> <?php /*_e('Archive', 'nks-custom') */?></label></p>
					<?php /*} */?>
				</div>-->
			<?php } ?>

			<h4 class="dw_toggle" style="cursor:pointer;"><?php _e('Categories') ?></h4>
			<div class="dw_collapse">
				<?php foreach ( $locations->cats as $cat ) {
					$catid = $cat->cat_ID;
					?>
					<p><input class="checkbox" type="checkbox"  value="<?php echo $catid?>" <?php checked(isset($user_opts->location->cats->$catid), true) ?> id="display_cat_<?php echo $catid . '_' . $index?>" name="display_cat_<?php echo $catid . '_' . $index?>" />
						<label for="display_cat_<?php echo $catid . '_' . $index?>"><?php echo $cat->cat_name ?></label></p>
					<?php
					unset($cat);
				}
				?>
			</div>

			<?php /*if ( !empty($this->taxes) ) { */?><!--
				<h4 class="dw_toggle" style="cursor:pointer;"><?php /*_e('Taxonomies', 'nks-custom') */?> +/-</h4>
				<div class="dw_collapse">
					<?php /*foreach ( $this->taxes as $tax ) {
						$instance['tax-'. $tax] = isset($instance['tax-'. $tax]) ? $instance['tax-'. $tax] : false;
						*/?>
						<p><input class="checkbox" type="checkbox" <?php /*checked($instance['tax-'. $tax], true) */?> id="<?php /*echo $widget->get_field_id('tax-'. $tax); */?>" name="<?php /*echo $widget->get_field_name('tax-'. $tax); */?>" />
							<label for="<?php /*echo $widget->get_field_id('tax-'. $tax); */?>"><?php /*echo str_replace(array('_','-'), ' ', ucfirst($tax)) */?></label></p>
						<?php
/*						unset($tax);
					}
					*/?>
				</div>
			--><?php /*} */?>

			<?php if ( !empty($locations->langs) ) { ?>
				<h4 class="dw_toggle" style="cursor:pointer;"><?php _e('Languages', 'nks-custom') ?></h4>
				<div class="dw_collapse">
					<?php foreach ( $locations->langs as $lang ) {
						$key = $lang['language_code'];
						?>
						<p><input class="checkbox" type="checkbox" <?php checked(isset($user_opts->location->langs->$key), true) ?> id="display_lang_<?php echo $key . '_' . $index?>" name="display_lang_<?php echo $key . '_' . $index?>" />
							<label for="display_lang_<?php echo $key . '_' . $index?>"><?php echo $lang['native_name'] ?></label></p>

						<?php
						unset($lang);
						unset($key);
					}
					?>
				</div>
			<?php } ?>

			<p><label for="display_ids_<?php echo $index?>"><?php _e('Comma Separated list of IDs of posts not listed above', 'nks-custom') ?>:</label>
				<input type="text" value="<?php echo implode(",", $user_opts->location->ids); ?>" name="display_ids_<?php echo $index?>" id="display_ids_<?php echo $index?>" />
			</p>
		</div>

		<a class="close_pop" href="#">Close</a>
		<button name='Submit' type='submit' id='sbmt_nks_cc_popup_<?php echo $index?>' class='display-sbmt button-primary' value='Save'>Save Options For&nbsp;&nbsp;<i class='fa <?php echo $options['nks_cc_fa_icon_'.$index] ?>'></i></button>

	</div>
	</p>
<?php
}


function nks_toggle_tab () {

}

function debug_to_console($data) {
	if(is_array($data) || is_object($data))
	{
		echo("<script>console.log('PHP: ".json_encode($data)."');</script>");
	} else {
		echo("<script>console.log('PHP: ".$data."');</script>");
	}
}






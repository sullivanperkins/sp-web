<?php
/*
Plugin Name: Ninja Kick: Sliding Panel
Plugin URI: http://sidebar.looks-awesome.com/
Description: Push/Sliding Panel on every page of your site.
Version: 2.3.10
Author: Looks Awesome
Author URI: http://looks-awesome.com/
License: Commercial License
Text Domain: nks-custom
Domain Path: /lang
*/

if (!defined('NKS_VERSION_KEY')) {
	define('NKS_VERSION_KEY', 'nks_version');
}

if (!defined('NKS_VERSION_NUM')) {
	define('NKS_VERSION_NUM', '2.3.10');
}

add_option(NKS_VERSION_KEY, NKS_VERSION_NUM);

global $nks_cc_options;
global $nks_init;

load_plugin_textdomain('nks-custom', false, basename( dirname( __FILE__ ) ) . '/lang' );

include_once(dirname(__FILE__) . '/settings.php');

add_action('wp_enqueue_scripts', 'nks_cc_scripts');

add_action( 'admin_menu', 'nks_cc_menu' );

function nks_cc_menu() {
    add_options_page( 'NK: Sliding Panel', '<span style="display: inline-block;border-left:3px solid #fdb814; padding-left:3px;position: relative;left: -6px;">NK: Sliding Panel</span>', 'manage_options', 'nks-custom-options', 'nks_cc_page' );
}

/**
 * Settings page in the WP Admin
 */
function nks_cc_page() {

	if ( !current_user_can( 'manage_options' ) )  {
		wp_die( __( 'You do not have sufficient permissions to access this page.', 'nks-custom' ) );
	}
  wp_enqueue_script("jquery");
	wp_enqueue_script( 'tinycolor', plugins_url('/js/tinycolor.js', __FILE__) );
	wp_enqueue_script( 'nks_cc_colorpickersliders', plugins_url('/js/jquery.colorpickersliders.js', __FILE__) );
	wp_enqueue_script( 'nks_cc_admin', plugins_url('/js/admin.js', __FILE__) );

	//wp_register_style('open-sans-font', 'http://fonts.googleapis.com/css?family=Open+Sans:400,300' );
	wp_register_style('open-sans-font', '//fonts.googleapis.com/css?family=Open+Sans:300normal,400normal,400italic,600normal,600italic&subset=all' );
	wp_enqueue_style( 'open-sans-font' );
  wp_register_style('colorpickersliders-ui-css', plugins_url('/css/jquery.colorpickersliders.css', __FILE__));
	wp_enqueue_style( 'colorpickersliders-ui-css' );

  wp_register_style('nks_cc_admin_css', plugins_url('/css/admin.css', __FILE__), array(), '20120208', 'all' );
	wp_enqueue_style( 'nks_cc_admin_css' );

	include_once(dirname(__FILE__) . '/options-page.php');
}


add_filter('plugin_action_links_NKS-custom/main.php', 'nks_cc_plugin_action_links', 10, 1);

function nks_cc_plugin_action_links($links) {
	$settings_page = add_query_arg(array('page' => 'nks-custom-options'), admin_url('options-general.php'));
	$settings_link = '<a href="'.esc_url($settings_page).'">'.__('Settings', 'nks-custom' ).'</a>';
	array_unshift($links, $settings_link);
	return $links;
}

add_action('wp_head', 'nks_cc_main_html', 10000);

function nks_is_mobile() {
	return preg_match("/(android|avantgo|blackberry|bolt|boost|cricket|docomo|fone|hiptop|mini|mobi|palm|phone|pie|tablet|up\.browser|up\.link|webos|wos)/i", $_SERVER["HTTP_USER_AGENT"]);
}

function nks_cc_main_html() {
	global $nks_init;
	$options = nks_cc_get_options();

	if ($options['nks_cc_test_mode'] === 'yes' && !current_user_can( 'manage_options' ) ) return;
	if (!isset($nks_init)) return;
	include_once(dirname(__FILE__) . '/nks-custom.php');
}

function nks_cc_scripts() {
	global $nks_init;

	$options = nks_cc_get_options();
	//browser()->log($options);
	if ($options['nks_cc_test_mode'] === 'yes' && !current_user_can( 'manage_options' ) ) return;

	$isMobile = nks_is_mobile();
	$indicators = (object)array();
	for ($i = 1; $i <= $options['nks_cc_tabs']; $i++) {
		$tab = 'tab_' . $i;
		$indicators->$tab = nks_show_tab(json_decode($options['nks_cc_display_' . $i]), $isMobile);
	}

	//browser()->log  ( 'main.php' );
	//browser()->log  ( $indicators );

	$options['indicators'] = $indicators;

	foreach ($indicators as $indicator) {
		//browser()->log  ( $indicator );
		if ($indicator) $nks_init = true;
	}

	if (!isset($nks_init)) return;

	$nks_init = $indicators;

	wp_enqueue_script(
		'nks_main',
//	  plugins_url('/js/nks-custom.js', __FILE__),
		plugins_url('/js/nks-custom.min.js', __FILE__),
		array('jquery')
	);

	wp_localize_script( 'nks_main', 'NKS_CC_Opts', array(
				'test_mode' => $options['nks_cc_test_mode'],
				'sidebar_type' => $options['nks_cc_sidebar_type'],
				'sidebar_pos' => $options['nks_cc_sidebar_pos'],
				'width' => $options['nks_cc_sidebar_width'],
				'base_color' => $options['nks_cc_base_color'],
				'fade_content' => $options['nks_cc_fade_content'],
				'label_top' => $options['nks_cc_label_top'],
				'label_top_mob' => $options['nks_cc_label_top_mob'],
				'label_size' => $options['nks_cc_label_size'],
				'label_vis' => $options['nks_cc_label_vis'],
				'label_invert' => $options['nks_cc_label_invert'],
				'label_no_anim' => $options['nks_cc_label_no_anim'],
			  'label_scroll_selector' => $options['nks_cc_label_vis_selector'],
			  'selectors' => $options['nks_cc_selectors'],
				'bg' => $options['nks_cc_image_bg'],
//				'label' => $options['nks_cc_label_style'],
//				'fa_icon' => $options['nks_cc_fa_icon'],
				'path' => plugins_url('/img/', __FILE__)
        )
    );


	wp_register_style( 'nks_cc_styles', plugins_url('/css/nks-custom.css', __FILE__) );
	wp_enqueue_style( 'nks_cc_styles' );
}


function register_nks_widget_area(){
	$options = nks_cc_get_options();

	if( function_exists( 'register_sidebar' ) ) {

		for ($i = 1; $i <= $options['nks_cc_tabs']; $i++) {
			register_sidebar( array(
				'name' => 'Ninja Kick Tab ' . $i,
				'id' => 'nks_area_' . $i,
				'description' => __( 'Widgets in this area will be shown in Ninja Kick Panel', 'nks-custom' ),
				'before_widget' => '<div class="widget">',
				'after_widget' => '</div>',
				'before_title' => '<h1 class="title">',
				'after_title' => '</h1>',
			) );
		}
  }
}

function nks_get_lang_id($id, $type = 'page') {
	if ( function_exists('icl_object_id') ) {
		$id = icl_object_id($id, $type, true);
	}

	return $id;
}

function nks_show_tab($opt, $isMobile) {

	//browser()->log  ( $opt );
	//browser()->log($isMobile);

	$post_id = get_queried_object_id();

	if ( is_home() ) {

		//browser()->log  ( 'home' );

		$show = isset($opt->location->wp_pages->home);
		if ( !$show && $post_id ){
			$show = isset($opt->location->pages->$post_id);
		}

		// check if blog page is front page too
		if ( !$show && is_front_page() /*&& isset($opt['page-front'])*/ ) {
			//browser()->log  ( 'home front' );
			$show = isset($opt->location->wp_pages->front);
		}

	} else if ( is_front_page() ) {
		//browser()->log  ( 'front' );

		$show = isset($opt->location->wp_pages->front);
		if ( !$show && $post_id ) {
			$show = isset($opt->location->pages->$post_id);
		}
	} else if ( is_category() ) {
		//browser()->log  ( 'cat' );
		//browser()->log  ( get_query_var('cat') );
		$catid = get_query_var('cat');
		$show = isset($opt->location->cats->$catid);
	} /*else if ( is_tax() ) {
				$term = get_queried_object();
				$tax = $term->taxonomy;
				$show = isset($opt->location->cats->$tax);
				unset($term);
				unset($tax);
			} else if ( is_post_type_archive() ) {
				$type = get_post_type();
				$show = isset($opt['type-'. $type .'-archive']) ? $opt['type-'. $type .'-archive'] : false;
			}*/ else if ( is_archive() ) {
		//browser()->log  ( 'archive' );

		$show = isset($opt->location->wp_pages->archive);
	} else if ( is_single() ) {
		//browser()->log  ( 'single' );

		$type = get_post_type();
		$show = isset($opt->location->wp_pages->single);

		if ( !$show  && $type != 'page' && $type != 'post') {
			$show = isset($opt->location->cposts->$type);
		}

		if ( !$show ) {
			$cats = get_the_category();
			foreach ( $cats as $cat ) {
				if ($show) break;
				$c_id = nks_get_lang_id($cat->cat_ID, 'category');
				$show = isset($opt->location->cats->$c_id);
				unset($c_id);
				unset($cat);
			}
		}

	} else if ( is_404() ) {
		$show = isset($opt->location->wp_pages->forbidden);
		//browser()->log  ( '404' );
		//browser()->log  ( isset($opt->location->wp_pages->forbidden));

	} else if ( is_search() ) {
		//browser()->log  ( 'search' );

		$show = isset($opt->location->wp_pages->search);
	} else if ( $post_id ) {
		//browser()->log  ( 'post id' );

		$show = isset($opt->location->pages->$post_id);
	} else {
		//browser()->log  ( 'super else' );

		$show = false;
	}

	if ( $post_id && !$show && isset($opt->location->ids) && !empty($opt->location->ids) ) {
		//browser()->log  ( 'ids' );

		$other_ids = $opt->location->ids;
		foreach ( $other_ids as $other_id ) {
			if ( $post_id == (int) $other_id ) {
				$show = true;
			}
		}
	}

	if ( !$show && defined('ICL_LANGUAGE_CODE') ) {
		// check for WPML widgets
		$show = isset($opt->location->langs->ICL_LANGUAGE_CODE);
	}


	if ( !isset($show) ) {
		//browser()->log  ( '!isset($show)' );
		$show = false;
	}

	//browser()->log  ( '>>>> inclusion' );
	//browser()->log  ( $show );

	if ($show && $opt->rule->exclude || !$show && $opt->rule->include ) {
		$show = false;
	} else  {
		$show = true;
	}

	$user_ID = is_user_logged_in();
	//browser()->log  ( '>>>> loggedin' );
	//browser()->log  ( $user_ID );
	//browser()->log  ( '>>>> checked' );
	//browser()->log  ( $show );

	if ( ( $opt->user->loggedout && $user_ID ) || ( $opt->user->loggedin && !$user_ID ) ) {
		$show = false;
	}

	if ( $opt->mobile->no && $isMobile) {
		$show = false;
	}

	return $show;
}

function nks_debug_to_console($data) {
	if(is_array($data) || is_object($data))
	{
		echo("<script>console.log('PHP: ".json_encode($data)."');</script>");
	} else {
		echo("<script>console.log('PHP: ".$data."');</script>");
	}
}

add_action( 'wp_loaded', 'register_nks_widget_area' );

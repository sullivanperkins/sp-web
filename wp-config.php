<?php


// ** MySQL settings ** //
/** The name of the database for WordPress */
define('DB_NAME', 'wordpress_develop');

/** MySQL database username */
define('DB_USER', 'wp');

/** MySQL database password */
define('DB_PASSWORD', 'wp');

/** MySQL hostname */
define('DB_HOST', 'localhost');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

define('AUTH_KEY',         'D36bI_E(MDfq/5{LMoFRMXSuZ,me)t5:s-ujAw.Sy2(y#AKX;xN28GLq?-@D-Lx4');
define('SECURE_AUTH_KEY',  'lA]TZH<M<r/uA^rL{xA T@M|PaewC3}zQJ| &XDP~2t9ym48r*-~jr%Ai6?w1WfX');
define('LOGGED_IN_KEY',    'gIVDq9i5%_QF@P A6tW_TOD}40bHhuc!^.H2-4U)l|[U-=i0~9<+@K>Q8L -2`B9');
define('NONCE_KEY',        ')g#}s|ar5r*SZA%$1[mRr[Y!c+;}*-P}.NG9=;d$shA5C:8.ueGS.WCIi#sL6Y2@');
define('AUTH_SALT',        'JKvO]PAlJXaP-AIP8(0-:*ppi{9+_UrU9X}+5hZ}!Pbe_DSzy+1-SXp/q/|+BlU>');
define('SECURE_AUTH_SALT', 'kEE>C-}A$wv3b3-wNP-j_ n+$4b2K|_`E?}>B3L:Gk[hMk=cYxQ;JWGqQ|<u/VAc');
define('LOGGED_IN_SALT',   '9|/Nn@u)8qlCTcpd<=+CMv0c?B_e 4l;CNE)}_-U_xJ)|o50u0A*.hM.wfJ$E1OH');
define('NONCE_SALT',       'fcU.jAIs$=Rkg `)NYB6f}@{bpgZB$x!+.-L+UWgWTIH5+YFC_)Zt3BX!-QzpZz$');


$table_prefix = 'wp_';


// Match any requests made via xip.io.
if ( isset( $_SERVER['HTTP_HOST'] ) && preg_match('/^(src|build)(.wordpress-develop.)\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(.xip.io)\z/', $_SERVER['HTTP_HOST'] ) ) {
	define( 'WP_HOME', 'http://' . $_SERVER['HTTP_HOST'] );
	define( 'WP_SITEURL', 'http://' . $_SERVER['HTTP_HOST'] );
} else if ( 'build' === basename( dirname( __FILE__ ) ) ) {
	// Allow (src|build).wordpress-develop.dev to share the same Database
	define( 'WP_HOME', 'http://build.wordpress-develop.dev' );
	define( 'WP_SITEURL', 'http://build.wordpress-develop.dev' );
}

define( 'WP_DEBUG', true );



/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { withDispatch, withSelect } from '@wordpress/data';
import { PostTypeSupportCheck } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import './style.scss';
import SidebarHeader from '../sidebar-header';

const SettingsHeader = ( { count, openDocumentSettings, openBlockSettings, openExtrasSettings, sidebarName, postType } ) => {
	// Do not display "0 Blocks".
	count = count === 0 ? 1 : count;

	return (
		<SidebarHeader
			className="edit-post-sidebar__panel-tabs"
			closeLabel={ __( 'Close settings' ) }
		>
			<PostTypeSupportCheck supportKeys="document" defaultValue={ true }>
				<button
					onClick={ openDocumentSettings }
					className={ `edit-post-sidebar__panel-tab ${ sidebarName === 'edit-post/document' ? 'is-active' : '' }` }
					aria-label={ __( 'Document settings' ) }
				>
					{ __( 'Document' ) }
				</button>
			</PostTypeSupportCheck>
			<button
				onClick={ openBlockSettings }
				className={ `edit-post-sidebar__panel-tab ${ sidebarName === 'edit-post/block' ? 'is-active' : '' }` }
				aria-label={ __( 'Block settings' ) }
			>
				{ sprintf( _n( 'Block', '%d Blocks', count ), count ) }
			</button>
			<PostTypeSupportCheck supportKeys="extras" defaultValue={ true }>
				<button
					onClick={ openExtrasSettings }
					className={ `edit-post-sidebar__panel-tab ${ sidebarName === 'edit-post/extras' ? 'is-active' : '' }` }
					aria-label={ __( 'Extras settings' ) }
				>
					{ get( postType, [ 'labels', 'extras' ], __( 'Extras' ) ) }
				</button>
			</PostTypeSupportCheck>
		</SidebarHeader>
	);
};

export default compose(
	withSelect( ( select ) => {
		const { getPostType } = select( 'core' );
		const { getSelectedBlockCount, getEditedPostAttribute } = select( 'core/editor' );
		
		return {
			count: getSelectedBlockCount(),
			postType: getPostType( getEditedPostAttribute( 'type' ) ),
		};
	 } ),
	withDispatch( ( dispatch ) => {
		const { openGeneralSidebar } = dispatch( 'core/edit-post' );
		const { clearSelectedBlock } = dispatch( 'core/editor' );
		return {
			openDocumentSettings() {
				openGeneralSidebar( 'edit-post/document' );
				clearSelectedBlock();
			},
			openBlockSettings() {
				openGeneralSidebar( 'edit-post/block' );
			},
			openExtrasSettings() {
				openGeneralSidebar( 'edit-post/extras' );
			},
		};
	} ),
)( SettingsHeader );
